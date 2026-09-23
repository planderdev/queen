export {adminPreference,saveAdminPreference} from './admin-preferences.js';
import {read} from '../stores/repository.js';
import {names} from './ui.js';
export const allowedAdminStatuses=()=>[];
export const collection=()=>[];
export const content=()=>[];
export const state=()=>({applications:[],registrations:[]});
export function recordAt(index){
 const q=new URLSearchParams(location.search),s=read();
 const keys={users:'users',organizations:'organizations',fundraisers:'fundraisers',transactions:'donations',recurring:'recurringPlans',refunds:'refundRequests',reports:'impactReports',campaigns:'campaigns',content:'content',inquiries:'inquiries',logs:'auditLogs'};
 let rows=s[keys[q.get('view')]]||[];
 if(q.get('view')==='transactions'&&q.get('status'))rows=rows.filter(r=>r.status===q.get('status'));
 const row=rows[index];if(!row)return null;
 const status=row.review||row.status||(row.suspended?'이용중지':q.get('view')==='users'?'활성':typeof row.published==='boolean'?(row.published?'공개':'비공개'):'');
 return {...row,title:row.title||row.name||row.id,summary:[row.description,row.body,row.email,row.action].filter(Boolean).join(' '),status:names[status]||status};
}
