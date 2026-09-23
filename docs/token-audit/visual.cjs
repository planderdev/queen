const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/pc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const phase=process.argv[2]||'before',out=path.resolve('docs/token-audit',phase);fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
const routes=['/','/donate/','/monthly/','/auth/','/partner/','/admin/','/design-system/?topic=typography','/design-system/?topic=button','/design-system/?topic=avatar','/corporate/','/my/'];
const report=[];
for(const width of [1440,390]) {
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
 for(const [i,route] of routes.entries()) {
  if(process.env.ONLY_CASES&&!process.env.ONLY_CASES.split(',').includes(`${width}-${i}`))continue;
  const page=await context.newPage();const errors=[];
  if(phase==='before')await page.route('http://127.0.0.1:8080/assets/**',async r=>{const local=path.join(process.env.BASELINE_ROOT||'C:/Users/pc/AppData/Local/Temp/queen-token-baseline','public',new URL(r.request().url()).pathname);if(fs.existsSync(local)&&/\.(css|js)$/.test(local))await r.fulfill({path:local,contentType:local.endsWith('.css')?'text/css':'text/javascript'});else await r.continue();});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto('http://127.0.0.1:8080'+route,{waitUntil:'networkidle'});
  await page.evaluate(async route=>{
   const role=route.startsWith('/partner')?'partner':route.startsWith('/admin')?'admin':route.startsWith('/corporate')?'corporate':route.startsWith('/my')?'donor':'guest';
   const {read,write}=await import('/assets/js/stores/repository.js');const state=read();state.role=role;write(state);
  },route);
  await page.reload({waitUntil:'networkidle'});
  await page.evaluate(async()=>{document.querySelectorAll('img').forEach(img=>img.loading='eager');await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));await document.fonts.ready;});
  await page.waitForFunction(()=>!document.querySelector('#main > .loading')&&!document.querySelector('#main')?.textContent.includes('페이지를 표시할 수 없어요'));
  await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
  await page.screenshot({path:path.join(out,`${width}-${i}.png`),fullPage:true});
  const data=await page.evaluate(()=>({fontStatus:document.fonts.status,fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),overflow:document.documentElement.scrollWidth>innerWidth,elements:[...document.querySelectorAll('body *')].map(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {tag:el.tagName,cls:typeof el.className==='string'?el.className:'svg',rect:[r.x,r.y,r.width,r.height],styles:Object.fromEntries([...s].filter(k=>!k.startsWith('--')).map(k=>[k,s.getPropertyValue(k)]))}})}));
  fs.writeFileSync(path.join(out,`${width}-${i}.json`),JSON.stringify(data)); report.push({width,route,errors,fontStatus:data.fontStatus,fonts:[...new Set(data.fonts)],overflow:data.overflow});await page.close();
 }
 await context.close();
}
const previous=process.env.ONLY_CASES&&fs.existsSync(path.join(out,'summary.json'))?JSON.parse(fs.readFileSync(path.join(out,'summary.json'),'utf8')):[];fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify([...previous.filter(p=>!report.some(r=>r.width===p.width&&r.route===p.route)),...report],null,2));console.log(JSON.stringify(report));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
