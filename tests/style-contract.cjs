const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const {foundations}=await import('../public/assets/js/design-system-foundations.js');
 const {tokenCss}=await import('../tools/build-tokens.mjs');
 const tokens=Object.assign({},...Object.values(foundations.tokens));
 assert.equal(fs.readFileSync('public/assets/css/tokens.css','utf8'),tokenCss,'Run npm run build:tokens after editing the design system');
 const names=Object.keys(tokens);assert.equal(new Set(names).size,names.length);
 const references=new Set();const local=new Set(['--chip-color','--ds-border','--avatar-size','--ds-icon','--sample-font-size','--sample-line-height','--sample-tracking']);
 function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='vendor'?[]:walk(path.join(dir,e.name))):[path.join(dir,e.name)]);}
 const generated=[path.join('public','design-system','index.html')];// standalone brand guide built by tools/build-guide.mjs with its own token aliases
 const files=[...walk('public'),...walk('app')].filter(f=>/\.(css|js|php|html)$/.test(f)&&!generated.includes(f));
 for(const file of files){
  const text=fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  if(file.endsWith('.css')&&!file.endsWith('tokens.css')){
   for(const [,name] of text.matchAll(/(--[\w-]+)\s*:/g))assert(!(name in tokens),`Design token override in ${file}: ${name}`);
   for(const [,value] of text.matchAll(/border(?:-[\w-]+)?-radius\s*:\s*([^;}]+)/g))assert(!/var\(--space-/.test(value),`Spacing token used for radius in ${file}: ${value}`);
  }
  for(const [,relative]of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g))assert(fs.existsSync(path.resolve(path.dirname(file),relative)),`Missing module ${relative} in ${file}`);
  assert(!text.includes('--qm-'),`Old token prefix in ${file}`);
  for(const [,n]of text.matchAll(/(?:var\(\s*|designToken\(['"])(--[\w-]+)(?=[)'",\s])/g)){if(n.endsWith('-')&&['--font-size-','--line-height-','--tracking-'].includes(n))continue;assert(n in tokens||local.has(n),`Undefined ${n} in ${file}`);references.add(n);}
 }
 for(const {name,base}of foundations.typography)for(const n of ['--font-size-'+base,'--line-height-'+name,'--tracking-'+base])assert(n in tokens,`Missing typography ${n}`);
 const done=new Set();function visit(n,trail=[]){assert(!trail.includes(n),`Cycle ${[...trail,n].join(' -> ')}`);if(done.has(n))return;for(const [,child]of tokens[n].matchAll(/var\((--[\w-]+)/g)){assert(child in tokens,`Undefined ${child}`);visit(child,[...trail,n]);}done.add(n);}names.forEach(n=>visit(n));
 assert.deepEqual(foundations.spacing,[4,8,12,16,20,24,32,40,48,56,64,80]);
 assert.deepEqual(foundations.radius,[4,8,12,16,20]);
 for(const file of ['app.css','design-system.css','site.css','home.css','community.css','programs.css']){
  const text=fs.readFileSync('public/assets/css/'+file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  assert(!/#[\da-f]{3,8}\b/i.test(text),'Component colors must use design-system tokens');
  const stack=[],seen=new Set();let start=0;
  for(let i=0;i<text.length;i++){
   if(text[i]==='{'){stack.push(text.slice(start,i).trim());start=i+1;}
   else if(text[i]===';'){
    const d=text.slice(start,i).trim(),split=d.indexOf(':');
    if(split>0){const prop=d.slice(0,split),value=d.slice(split+1),key=stack.join('|')+'|'+prop;assert(!seen.has(key),`Duplicate ${file}: ${key}`);seen.add(key);
     if(/^(gap|row-gap|column-gap|(?:scroll-)?(?:margin|padding)(?:-[\w-]+)?)$/.test(prop)&&!stack.some(s=>s.includes('sr-only')))assert(!/-?\d+(?:\.\d+)?px/.test(value),`Untokenized spacing ${file} ${key}: ${value}`);
     if(/^(font-size|font-weight|line-height|letter-spacing|border-radius)$/.test(prop))assert(!/(?:^|\s|,)\d+(?:\.\d+)?(?:px|em)(?:\s|;|!|$)/.test(value),`Untokenized type/radius ${file} ${key}`);
    }start=i+1;
   }else if(text[i]==='}'){stack.pop();start=i+1;}
  }assert.equal(stack.length,0,`${file} unbalanced rules`);
 }
 console.log(`Style contract passed: ${names.length} design-system tokens, ${files.length} sources; no qm prefix, missing references, cycles, duplicate declarations or off-scale CSS spacing.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
