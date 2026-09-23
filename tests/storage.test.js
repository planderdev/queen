import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../public/assets/js/stores/repository.js';
test('초기 생성 시각 영속화와 재진입 동일 값',()=>{const map=new Map();globalThis.localStorage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};R.invalidate();const a=R.read();assert.ok(map.has(R.STORAGE_KEY));R.invalidate();assert.equal(R.read().clock,a.clock);});
test('손상된 JSON 복구와 경고',()=>{globalThis.localStorage={getItem:()=>'{broken',setItem:()=>{}};R.invalidate();assert.ok(R.read().users.length);assert.ok(R.storageWarning);});
test('용량 초과 메모리 폴백',()=>{globalThis.localStorage={getItem:()=>null,setItem:()=>{throw Error('quota');}};R.invalidate();const s=R.read();s.users[0].name='테스트';R.write(s);assert.equal(R.read().users[0].name,'테스트');assert.ok(R.storageWarning.includes('저장 공간'));});
