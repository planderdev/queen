const fs=require('node:fs');
const dir='public/assets/css';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.css')&&f!=='tokens.css');
const duplicates=[],fragments=[],scoped=[];
function selectors(value){let depth=0,buffer='',out=[];for(const c of value){if(c==='('||c==='[')depth++;if(c===')'||c===']')depth--;if(c===','&&!depth){out.push(buffer.trim());buffer='';}else buffer+=c;}out.push(buffer.trim());return out;}
for(const file of files){
 const text=fs.readFileSync(`${dir}/${file}`,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
 const stack=[],seen=new Map(),blocks=new Map();let start=0;
 for(let i=0;i<text.length;i++){
  if(text[i]==='{'){
   const label=text.slice(start,i).trim();stack.push(label);start=i+1;
   if(!label.startsWith('@'))for(const selector of selectors(label)){
    const key=stack.slice(0,-1).join('|')+'|'+selector;
    blocks.set(key,(blocks.get(key)||0)+1);
    if(selector.includes('.public-site ')||selector.includes('.ds-stage '))scoped.push({file,selector});
   }
  }else if(text[i]===';'){
   const d=text.slice(start,i).trim(),split=d.indexOf(':');start=i+1;
   if(split<0||!stack.length)continue;
   for(const selector of selectors(stack.at(-1))){
    const key=stack.slice(0,-1).join('|')+'|'+selector+'|'+d.slice(0,split).trim();
    if(seen.has(key))duplicates.push({file,key});seen.set(key,true);
   }
  }else if(text[i]==='}'){stack.pop();start=i+1;}
 }
 for(const [key,count]of blocks)if(count>1)fragments.push({file,key,count});
}
const report={files:files.length,duplicateProperties:duplicates.length,fragmentedSelectors:fragments.length,fragments,scoped};
if(process.argv.includes('--report'))fs.writeFileSync('docs/css-cascade-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(`Cascade audit: ${files.length} stylesheets; ${duplicates.length} repeated selector/property declarations; ${fragments.length} fragmented selectors.`);
if(duplicates.length){console.error(duplicates);process.exitCode=1;}
const sharedFragments=fragments;
if(sharedFragments.length){console.error('Selectors must have one definition per file and condition:',sharedFragments);process.exitCode=1;}
