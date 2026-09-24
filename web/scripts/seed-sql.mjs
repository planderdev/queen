// Emits supabase/migrations/20260924000002_seed.sql from lib/data/seed-data.mjs so the seed content
// and the preview-mode data never drift. Run: npm run seed:sql (inside web/)
import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as seed from '../lib/data/seed-data.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'supabase', 'migrations', '20260924000002_seed.sql');
const isIso = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v);
const q = (v) => isIso(v) ? `(now() + interval '${seed.dayOffset(v)} days')` : v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : typeof v === 'boolean' ? String(v) : Array.isArray(v) || typeof v === 'object' ? `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb` : `'${String(v).replace(/'/g, "''")}'`;
const insert = (table, rows, cols) => rows.length ? `insert into public.${table} (${cols.join(', ')}) values\n${rows.map((r) => `  (${cols.map((c) => q(r[c])).join(', ')})`).join(',\n')}\non conflict (id) do update set ${cols.filter((c) => c !== 'id').map((c) => `${c} = excluded.${c}`).join(', ')};\n` : '';

let sql = `-- 초기 콘텐츠 시드 (생성: web/scripts/seed-sql.mjs). 단체·모금·사연·수치는 예시이며 운영 전 실제 값으로 교체합니다.\n\n`;
sql += insert('organizations', seed.organizations, ['id', 'slug', 'name', 'category', 'description', 'image', 'status', 'created_at']);
sql += insert('fundraisers', seed.fundraisers.map(({ seedAmount, ...f }) => ({ ...f, budget: f.budget })), ['id', 'slug', 'organization_id', 'title', 'story', 'image', 'category', 'region', 'target', 'start_at', 'end_at', 'budget', 'review', 'publication', 'created_at']);
// 행사(event) 캠페인은 enum 값이 이후 마이그레이션에서 추가되므로 시드에서 제외한다.
sql += insert('campaigns', seed.campaigns.filter((c) => c.type !== 'event'), ['id', 'slug', 'partner_name', 'title', 'description', 'type', 'fundraiser_id', 'limit_amount', 'rate', 'image', 'review', 'start_at', 'end_at', 'created_at']);
sql += insert('content', seed.content, ['id', 'slug', 'type', 'title', 'body', 'category', 'image', 'fundraiser_id', 'published', 'created_at']);
sql += `insert into public.settings (key, value) values\n  ('categories', ${q(seed.categories)}),\n  ('regions', ${q(seed.regions)}),\n  ('bank', ${q(seed.bank)})\non conflict (key) do nothing;\n`;
sql += `\n-- 예시 모금액: 데모의 초기 모금액을 익명 기부(입금 확인 완료)로 기록. 실제 운영 전 삭제하려면 아래 행을 지우거나 status를 cancelled로 바꿉니다.\n`;
const seeded = seed.fundraisers.filter((f) => f.seedAmount > 0);
sql += `insert into public.donations (id, number, user_id, fundraiser_id, kind, amount, status, method, depositor_name, anonymous, message, confirmed_at, created_at) values\n${seeded.map((f, i) => `  ('55555555-0000-4000-8000-0000000000${String(i + 1).padStart(2, '0')}', 'QM-SEED-${String(i + 1).padStart(3, '0')}', null, ${q(f.id)}, 'donation', ${f.seedAmount}, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', ${q(f.created_at)}, ${q(f.created_at)})`).join(',\n')}\non conflict (id) do nothing;\n`;
writeFileSync(out, sql);
console.log(`${out} 생성 (${(sql.length / 1024).toFixed(1)} KB)`);
