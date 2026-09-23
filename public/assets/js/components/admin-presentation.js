let editor;
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
   area.hidden=true;area.required=false;
  });
  form.querySelector('[name="type"]').addEventListener('change',event=>{
   const plain=event.target.value==='recommend';host.hidden=plain;area.hidden=!plain;
   form.adminEditor=plain?null:editor;
  });
 }
 document.querySelectorAll('.admin-main form.panel').forEach(e=>e.className='editor-section');

 document.querySelectorAll('.admin-main .table-wrap').forEach(w=>{w.className='data-table-wrap';w.querySelector('table').classList.add('data-table');});
 document.querySelectorAll('.admin-main .badge').forEach(e=>{
  const tone=['승인','성공','진행 중','지급 완료'].includes(e.textContent)?'approved':['반려','실패','취소'].includes(e.textContent)?'rejected':'pending';
  e.className='badge status-'+tone;
 });
 document.querySelectorAll('.admin-main .notice').forEach(e=>e.className='admin-dashboard-section');
 enhanceAdminTables();
}
