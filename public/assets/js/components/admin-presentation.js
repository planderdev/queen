let editor;
import {hydrateFormControls} from './form-controls.js';
import {enhanceAdminTables} from './admin-tables.js';
export function mountAdminPresentation(){
 editor?.destroy();editor=null;
 const form=document.querySelector('[data-form="content"]');
 if(form){
  form.className='editor-section';
  const area=form.querySelector('[name="body"]');
  const host=document.createElement('div');host.className='rich-editor';area.after(host);
  import('../../vendor/sports-admin/rich-editor.js').then(({createRichEditor})=>createRichEditor(host,{body:area.value},{onChange:()=>{if(editor)area.value=editor.serialize().bodyText;}})).then(instance=>{
   if(!form.isConnected){instance.destroy();return;}editor=instance;form.adminEditor=instance;
   area.hidden=true;area.required=false;sync();
  });
  const bodyLabels={notice:'공지 본문',faq:'답변 내용',story:'스토리 본문',news:'소식 본문',banner:'배너 문구'};
  const sync=()=>{
   const type=form.querySelector('[name="type"]').value;
   form.querySelectorAll('[data-content-for]').forEach(section=>{
    const active=section.dataset.contentFor.split(' ').includes(type);
    section.hidden=!active;
    section.querySelectorAll('input,select,textarea').forEach(el=>el.disabled=!active);
   });
   const label=area.closest('.field')?.querySelector('span');if(label&&bodyLabels[type])label.textContent=bodyLabels[type];
   const plain=type==='recommend';host.hidden=plain;form.adminEditor=plain?null:editor;
  };
  form.querySelector('[name="type"]').addEventListener('change',sync);
  form.addEventListener('reset',()=>setTimeout(sync,0));
  sync();
 }
 document.querySelectorAll('.admin-main form.panel').forEach(e=>e.className='editor-section');

 document.querySelectorAll('.admin-main .table-wrap').forEach(w=>{w.className='data-table-wrap';w.querySelector('table').classList.add('data-table');});
 // Palette classes from ui.js badges map onto the admin status palette (design-system chip semantics).
 const tones={olive:'approved',blue:'received',lavender:'draft',orange:'pending',rose:'rejected'};
 document.querySelectorAll('.admin-main .badge').forEach(e=>{
  const palette=[...e.classList].find(c=>tones[c]);
  const tone=palette?tones[palette]:['승인','성공','진행 중','지급 완료'].includes(e.textContent)?'approved':['반려','실패','취소'].includes(e.textContent)?'rejected':'pending';
  e.className='badge status-'+tone;
 });
 document.querySelectorAll('.admin-main .notice').forEach(e=>e.className='admin-dashboard-section');
 enhanceAdminTables();
 hydrateFormControls({selects:false});
 globalThis.lucide?.createIcons({attrs:{'stroke-width':1.7}});
}
