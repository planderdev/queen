from pathlib import Path
import re,json,subprocess,collections,sys
import tinycss2
ROOT=Path.cwd()
files=[Path(x) for x in subprocess.check_output(['git','ls-files'],text=True,encoding='utf-8').splitlines() if Path(x).suffix in ('.css','.js','.php','.html','.md','.json','.cjs') and '/vendor/' not in x and not x.startswith('docs/token-audit/')]
def audit():
    baseline=Path(sys.argv[2]) if len(sys.argv)>2 else None
    def read(p):
        candidate=baseline/p if baseline else p
        return (candidate if candidate.exists() else p).read_text(encoding="utf-8-sig")
    declarations=collections.defaultdict(list); uses=collections.defaultdict(list); mentions=collections.defaultdict(list)
    for p in files:
        s=read(p); runtime=p.parts[0] in ('public','app')
        for m in re.finditer(r'(--qm-[\w-]+)\s*:\s*([^;{}]+);',s):
            if runtime: declarations[m[1]].append({'file':p.as_posix(),'line':s.count('\n',0,m.start())+1,'value':m[2].strip()})
        contexts={}
        if p.suffix=='.css':
            def walk(rules,parents=()):
                for r in rules:
                    if r.type=='at-rule' and r.content: walk(tinycss2.parse_rule_list(r.content,skip_comments=True,skip_whitespace=True),parents+('@'+r.lower_at_keyword+' '+tinycss2.serialize(r.prelude).strip(),))
                    elif r.type=='qualified-rule':
                        selector=tinycss2.serialize(r.prelude).strip()
                        for d in tinycss2.parse_declaration_list(r.content,skip_comments=True,skip_whitespace=True):
                            if d.type=='declaration': contexts[d.source_line]=' / '.join((*parents,selector,d.name))
            walk(tinycss2.parse_stylesheet(s,skip_comments=True,skip_whitespace=True))
        for m in re.finditer(r'--qm-[\w-]+',s):
            if s[m.end():].lstrip().startswith(':'): continue
            item={'file':p.as_posix(),'line':s.count('\n',0,m.start())+1,'context':s[max(s.rfind('{',0,m.start()),s.rfind('}',0,m.start()))+1:m.start()].strip()[-180:]}
            item['context']=contexts.get(item['line'],item['context'])
            (uses if runtime else mentions)[m[0]].append(item)
    p=ROOT/'public/assets/js/pages/design-system-catalog.js'; s=read(p.relative_to(ROOT))
    page=read(Path('public/assets/js/pages/design-system.js'))
    if '--qm-font-size-${z}' in page:
        for name,z,l,k in re.findall(r"\['([^']+)',(\d+),(\d+),(-?[.\d]+)\]",s.split('export const types=')[1].split(';')[0]):
            k=str(float(k)).replace('-', 'negative-').replace('.','_'); k='0' if float(k.replace('negative-','-').replace('_','.'))==0 else k
            for n in [f'--qm-font-size-{z}',f'--qm-size-{l}',f'--qm-tracking-{k}']:
                uses[n].append({'file':'public/assets/js/pages/design-system.js','line':12,'context':'dynamic typography: '+name})
    if '--qm-size-${n}' in page:
        for n in [16,20,24,32]: uses[f'--qm-size-{n}'].append({'file':'public/assets/js/pages/design-system.js','line':16,'context':'dynamic icon example'})
    if '--qm-size-${n}' in s:
        for n in [32,40,48,64]: uses[f'--qm-size-{n}'].append({'file':'public/assets/js/pages/design-system-catalog.js','line':64,'context':'dynamic avatar example'})
    for n in list(uses):
        if n.endswith('-') and n not in declarations: del uses[n]
    values={n:d[-1]['value'] for n,d in declarations.items()}
    def resolve(n,trail=()):
        if n in trail: raise ValueError(' -> '.join((*trail,n)))
        return re.sub(r'var\((--qm-[\w-]+)\)',lambda m:resolve(m[1],(*trail,n)),values.get(n,'UNDEFINED:'+n))
    cycles=[]; resolved={}
    for n in values:
        try: resolved[n]=resolve(n)
        except ValueError as e: cycles.append(str(e))
    groups=collections.defaultdict(list)
    for n,v in resolved.items():
        match=re.fullmatch(r'(-?(?:\d*\.)?\d+)(px|em|ms|s)?',v)
        key=(f'{float(match[1]):g}'+(match[2] or '')) if match else v
        groups[key].append(n)
    return {'scanned_files':[p.as_posix() for p in files],'count':len(values),'tokens':{n:{'declarations':d,'references':uses[n],'count':len(uses[n]),'other_mentions':mentions[n],'resolved':resolved.get(n)} for n,d in declarations.items()},'unused':[n for n in declarations if not uses[n]],'undefined':{n:u for n,u in uses.items() if n not in declarations},'duplicates':{n:d for n,d in declarations.items() if len(d)>1},'equal_values':{v:n for v,n in groups.items() if len(n)>1},'cycles':cycles}
if __name__=='__main__':
    import sys
    a=audit(); out=Path(sys.argv[1]);out.write_text(json.dumps(a,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in a.items() if k!='tokens'},ensure_ascii=False,indent=2))
