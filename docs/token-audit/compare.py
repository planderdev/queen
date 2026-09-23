from pathlib import Path
import json,re,tinycss2,os
from PIL import Image,ImageChops
baseline=Path(os.environ.get('BASELINE_ROOT','C:/Users/pc/AppData/Local/Temp/queen-token-baseline'))
def declarations(root):
 defs=dict(re.findall(r'(--qm-[\w-]+):\s*([^;]+);',(root/'public/assets/css/tokens.css').read_text(encoding='utf-8')))
 def resolve(s):return re.sub(r'var\((--qm-[\w-]+)\)',lambda m:resolve(defs[m[1]]),s)
 out={}
 for file in ['app.css','design-system.css']:
  def walk(rules,parents=()):
   for r in rules:
    if r.type=='at-rule' and r.content:walk(tinycss2.parse_rule_list(r.content,skip_whitespace=True,skip_comments=True),parents+('@'+r.lower_at_keyword+' '+tinycss2.serialize(r.prelude).strip(),))
    elif r.type=='qualified-rule':
     sel=tinycss2.serialize(r.prelude).strip().replace('.hero .hero-slide','.hero-slide').replace('.ds-doc-section .ds-reading','.ds-reading')
     if sel=='.category-icon':sel='.category-nav .category-icon'
     for d in tinycss2.parse_declaration_list(r.content,skip_whitespace=True,skip_comments=True):
      if d.type=='declaration':out[' / '.join((file,*parents,sel,d.name))]=resolve(tinycss2.serialize(d.value).strip())
  walk(tinycss2.parse_stylesheet((root/'public/assets/css'/file).read_text(encoding='utf-8'),skip_whitespace=True,skip_comments=True))
 return out
before=declarations(baseline);after=declarations(Path('.'))
report={'declarations_compared':len(before),'declaration_differences':{k:[v,after.get(k)] for k,v in before.items() if v!=after.get(k)},'added_declarations':{k:v for k,v in after.items() if k not in before},'screens':[]}
for p in Path('docs/token-audit/before').glob('*.json'):
 if p.name=='summary.json':continue
 q=Path('docs/token-audit/after')/p.name
 if not q.exists():continue
 x=json.loads(p.read_text());y=json.loads(q.read_text());diff=[]
 for i,(u,v) in enumerate(zip(x['elements'],y['elements'])):
  if u['rect']!=v['rect']:diff.append({'element':i,'class':u['cls'],'property':'rect','before':u['rect'],'after':v['rect']})
  for k,w in u['styles'].items():
   if w!=v['styles'].get(k):diff.append({'element':i,'class':u['cls'],'property':k,'before':w,'after':v['styles'].get(k)})
 im1=Image.open(p.with_suffix('.png')).convert('RGB');im2=Image.open(q.with_suffix('.png')).convert('RGB')
 bbox=ImageChops.difference(im1,im2).getbbox() if im1.size==im2.size else 'size differs'
 report['screens'].append({'file':p.stem,'elements_before':len(x['elements']),'elements_after':len(y['elements']),'differences':diff,'pixel_difference_bbox':bbox})
Path('docs/token-audit/comparison.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'declarations_compared':report['declarations_compared'],'declaration_differences':len(report['declaration_differences']),'screens':len(report['screens']),'style_differences':sum(len(s['differences']) for s in report['screens']),'pixel_differences':[s['file'] for s in report['screens'] if s['pixel_difference_bbox']]},indent=2))
