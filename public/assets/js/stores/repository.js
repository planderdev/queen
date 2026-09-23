import {makeSeed,config} from '../data.js';
export const STORAGE_KEY='queen-mandeok:v1';
let memory; export let storageWarning='';
const clone=value=>globalThis.structuredClone?globalThis.structuredClone(value):JSON.parse(JSON.stringify(value));
const tables=['users','organizations','fundraisers','donations','recurringPlans','recurringPayments','corporatePartners','campaigns','participations','matchingContributions','payouts','impactReports','comments','bookmarks','notifications','inquiries','moderationReports','auditLogs','refundRequests','content'];
export function read(){
 if(memory)return clone(memory);
 try {const raw=globalThis.localStorage?.getItem(STORAGE_KEY); if(raw){const parsed=JSON.parse(raw);if(parsed.schema!==config.schema){memory=makeSeed();globalThis.localStorage?.setItem(STORAGE_KEY,JSON.stringify(memory));storageWarning='데모 데이터 구조가 바뀌어 새 데모로 시작했습니다.';}else{if(tables.some(k=>!Array.isArray(parsed[k]))||!parsed.drafts||!parsed.settings||!Number.isFinite(Date.parse(parsed.clock))||!parsed.users.length)throw Error('schema'); memory=parsed;}} else {memory=makeSeed();globalThis.localStorage?.setItem(STORAGE_KEY,JSON.stringify(memory));}}
 catch{storageWarning='저장 데이터를 읽지 못해 새 데모를 시작했습니다. 기존 저장소는 초기화 전까지 유지됩니다.';memory=makeSeed();}
 return clone(memory);
}
export function write(data){
 const next=clone(data);next.revision=(next.revision||0)+1;
 try{globalThis.localStorage?.setItem(STORAGE_KEY,JSON.stringify(next));}catch{storageWarning='브라우저 저장 공간을 사용할 수 없어 이 탭에서만 변경사항이 유지됩니다.';}
 memory=next;return clone(next);
}
export function reset(now){memory=makeSeed(now);storageWarning='';return write(memory);}
export function invalidate(){memory=undefined;}
if(globalThis.addEventListener)globalThis.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){invalidate();globalThis.dispatchEvent(new Event('qm:change'));}});
