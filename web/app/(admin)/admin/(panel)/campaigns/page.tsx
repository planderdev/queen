import Link from 'next/link';
import { adminCampaigns, adminRegistrations } from '@/lib/data/admin';
import { date, dateTime, campaignTypeNames } from '@/lib/format';
import { AdminBadge } from '@/components/admin/AdminUI';
import { ActionButton } from '@/components/admin/AdminActions';
import { setCampaignReview, setRegistrationOpen, setRegistrationStatus } from '@/lib/actions/admin';
import type { Campaign, CampaignRegistration } from '@/lib/data/types';

export const metadata = { title: '캠페인·참가 신청' };

type Row = CampaignRegistration & { no: number };
type SP = { id?: string; status?: string; sort?: string; dir?: string; q?: string; view?: string };

const STATUS_TABS: [string, string][] = [['', '전체'], ['pending', '입금 대기'], ['confirmed', '입금 확인'], ['cancelled', '취소']];
const STATUS_ORDER: Record<string, number> = { pending: 0, confirmed: 1, cancelled: 2 };
const STATUS_LABEL: Record<string, string> = { pending: '입금 대기', confirmed: '입금 확인', cancelled: '취소' };
// 명단용 짧은 일시: 09.24 16:57
const shortTime = (v: string) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(v)).replace(/\.\s?/g, '.').replace(/\.$/, '').replace(/\.(\d{2}:)/, ' $1');
const isFull = (c: Campaign) => c.capacity != null && (c.confirmed_count ?? 0) >= c.capacity;
const isLive = (c: Campaign) => c.review === 'approved' && new Date(c.end_at).getTime() > Date.now();

// 캠페인·참가 신청 — 기본 화면은 진행 중인 행사의 신청자 명단(상세). 전체 캠페인 목록은 ?view=list 에서만.
export default async function AdminCampaignsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const campaigns = await adminCampaigns();
  const events = campaigns.filter((c) => c.type === 'event');
  if (sp.view === 'list' || !events.length) return <CampaignList campaigns={campaigns} />;
  const target = events.find((c) => c.id === sp.id) ?? events.find(isLive) ?? events[0];
  const all: Row[] = (await adminRegistrations(target.id)).map((r, i) => ({ ...r, no: i + 1 }));
  return <Roster campaign={target} events={events} rows={all} sp={sp} />;
}

function Roster({ campaign: c, events, rows: all, sp }: { campaign: Campaign; events: Campaign[]; rows: Row[]; sp: SP }) {
  const questions = c.details.questions ?? [];
  const status = STATUS_TABS.some(([v]) => v === sp.status) ? sp.status ?? '' : '';
  const q = (sp.q ?? '').trim();
  // 정렬: 기본은 신청 순(No.) 오름차순 — 선착순 처리 순서 그대로
  const sortKeys: Record<string, (r: Row) => string | number> = {
    no: (r) => r.no, name: (r) => r.name, depositor: (r) => r.depositor_name || r.name, age: (r) => r.age_group ?? '', status: (r) => STATUS_ORDER[r.status] ?? 9,
    ...Object.fromEntries(questions.map((qq) => [`q_${qq.key}`, (r: Row) => { const v = r.answers?.[qq.key] ?? ''; const i = qq.options.indexOf(v); return i < 0 ? 99 : i; }]))
  };
  const sort = sp.sort && sortKeys[sp.sort] ? sp.sort : 'no';
  const dir = sp.dir === 'desc' ? 'desc' : 'asc';
  const count = (s: string) => (s ? all.filter((r) => r.status === s).length : all.length);
  const rows = all
    .filter((r) => !status || r.status === status)
    .filter((r) => !q || [r.name, r.phone, r.email, r.depositor_name].some((v) => (v ?? '').replace(/-/g, '').includes(q.replace(/-/g, ''))))
    .sort((a, b) => { const ka = sortKeys[sort](a), kb = sortKeys[sort](b); const d = typeof ka === 'number' && typeof kb === 'number' ? ka - kb : String(ka).localeCompare(String(kb), 'ko'); return (dir === 'asc' ? d : -d) || a.no - b.no; });
  // 현재 상태·검색·정렬을 유지한 채 일부만 바꾼 주소 (기본값 no·asc 는 주소에서 생략)
  const href = (patch: Partial<SP>) => {
    const m: Record<string, string | undefined> = { id: c.id, status, q, sort, dir, ...patch };
    if (m.sort === 'no' && m.dir === 'asc') { delete m.sort; delete m.dir; }
    return `/admin/campaigns?${new URLSearchParams(Object.entries(m).filter((e): e is [string, string] => Boolean(e[1])))}`;
  };
  const confirmed = c.confirmed_count ?? 0;
  const full = isFull(c);
  const left = c.capacity != null ? Math.max(0, c.capacity - confirmed) : null;
  const pct = c.capacity ? Math.min(100, Math.round((confirmed / c.capacity) * 100)) : 0;
  const Th = ({ k, label, className }: { k: string; label: string; className?: string }) => {
    const active = sort === k;
    const next = active && dir === 'asc' ? 'desc' : 'asc';
    return (
      <th scope="col" className={className} aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <Link className={`qa-sort${active ? ' is-active' : ''}`} href={href({ sort: k, dir: next })} title={`${label} ${next === 'asc' ? '오름차순' : '내림차순'} 정렬`}>
          {label}<i className={`ri-${active ? (dir === 'asc' ? 'arrow-up-line' : 'arrow-down-line') : 'arrow-up-down-line'}`} aria-hidden="true"></i>
        </Link>
      </th>
    );
  };
  return (
    <div className="qa-roster">
      <header className="qa-head">
        <div className="qa-head-copy">
          <p className="qa-eyebrow">{campaignTypeNames[c.type]} 캠페인 · 신청자 명단</p>
          <h1>{c.title}</h1>
          <p className="qa-meta">{c.partner_name} · 신청 {date(c.start_at)} ~ {dateTime(c.end_at)} {c.review === 'approved' ? <span className="badge status-approved">공개 중</span> : <span className="badge status-draft">숨김</span>} {full ? <span className="badge status-rejected">정원 마감</span> : c.registration_open ? <span className="badge status-received">접수 중</span> : <span className="badge status-draft">신청 마감</span>}</p>
        </div>
        <div className="qa-head-actions">
          {events.length > 1 && (
            <form action="/admin/campaigns" className="qa-switch">
              <label className="sr-only" htmlFor="qa-campaign">행사 선택</label>
              <select id="qa-campaign" name="id" defaultValue={c.id}>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select>
              <button type="submit" className="button small secondary">이동</button>
            </form>
          )}
          <a className="button small secondary" href={`/campaigns/${c.slug}`} target="_blank" rel="noopener">사이트에서 보기 <i className="ri-external-link-line" aria-hidden="true"></i></a>
          <ActionButton label={c.registration_open ? '신청 마감' : '신청 재개'} className="button small secondary" confirmText={c.registration_open ? '신규 참가 신청을 마감할까요? 이미 받은 신청은 그대로 남습니다.' : undefined} onRun={setRegistrationOpen.bind(null, c.id, !c.registration_open)} />
          <ActionButton label={c.review === 'approved' ? '숨기기' : '공개'} className="button small secondary" onRun={setCampaignReview.bind(null, c.id, c.review === 'approved' ? 'draft' : 'approved')} />
          <a className="button small primary" href={`/api/admin/campaigns/${c.id}/registrations.csv`}><i className="ri-download-2-line" aria-hidden="true"></i> CSV</a>
        </div>
      </header>

      <section className="qa-stats" aria-label="모집 현황">
        <div className="qa-stat qa-stat-main">
          <span>입금 확인</span>
          <strong>{confirmed}<small>{c.capacity != null ? ` / ${c.capacity}명` : '명'}</small></strong>
          {c.capacity != null && <div className="qa-meter" role="meter" aria-valuemin={0} aria-valuemax={c.capacity} aria-valuenow={confirmed} aria-label="정원 대비 입금 확인"><span style={{ width: `${pct}%` }} /></div>}
          <em>{full ? '정원이 모두 찼습니다 · 신규 신청 중단' : left != null ? `잔여 ${left}석 · 정원에 닿으면 자동 마감` : '정원 제한 없음'}</em>
        </div>
        <Link className="qa-stat" href={href({ status: 'pending' })}><span>입금 대기</span><strong>{count('pending')}<small>명</small></strong><em>통장 입금 확인 필요</em></Link>
        <Link className="qa-stat" href={href({ status: '' })}><span>전체 신청</span><strong>{count('')}<small>명</small></strong><em>취소 포함</em></Link>
        <Link className="qa-stat" href={href({ status: 'cancelled' })}><span>취소</span><strong>{count('cancelled')}<small>명</small></strong><em>환불·중복 정리</em></Link>
      </section>

      {c.details.bank && <p className="qa-bank"><i className="ri-bank-line" aria-hidden="true"></i> 입금 계좌 <b>{c.details.bank.bank} {c.details.bank.account}</b> (예금주 {c.details.bank.holder}){c.fee_amount > 0 && <> · 참가비 <b>{c.fee_amount.toLocaleString('ko-KR')}원</b></>} — 통장 입금자명과 명단의 ‘입금자명’을 대조해 입금 확인을 눌러주세요.</p>}

      <section className="qa-board">
        <div className="qa-toolbar">
          <nav className="qa-tabs" aria-label="신청 상태">
            {STATUS_TABS.map(([v, label]) => <Link key={v || 'all'} href={href({ status: v })} aria-current={status === v ? 'page' : undefined}>{label}<span>{count(v)}</span></Link>)}
          </nav>
          <form action="/admin/campaigns" className="qa-search" role="search">
            <input type="hidden" name="id" value={c.id} />{status && <input type="hidden" name="status" value={status} />}{sort !== 'no' && <input type="hidden" name="sort" value={sort} />}{dir !== 'asc' && <input type="hidden" name="dir" value={dir} />}
            <i className="ri-search-line" aria-hidden="true"></i>
            <label className="sr-only" htmlFor="qa-q">신청자 검색</label>
            <input id="qa-q" name="q" type="search" defaultValue={q} placeholder="성함·연락처·이메일·입금자명" />
            {q && <Link className="qa-search-clear" href={href({ q: '' })} aria-label="검색 지우기"><i className="ri-close-line" aria-hidden="true"></i></Link>}
          </form>
        </div>

        {rows.length ? (
          <div className="data-table-wrap admin-table-scroll qa-table-wrap" tabIndex={0} aria-label="신청자 명단 · 가로 스크롤 가능">
            <table className="data-table qa-table">
              <thead><tr>
                <Th k="no" label="No." className="qa-col-no" />
                <th scope="col">신청일시</th>
                <Th k="name" label="성함" />
                <Th k="depositor" label="입금자명" />
                {questions.map((qq) => <Th key={qq.key} k={`q_${qq.key}`} label={qq.short ?? qq.label} />)}
                <Th k="age" label="성별·연령" />
                <Th k="status" label="상태" />
                <th scope="col" className="qa-col-actions">처리</th>
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={`is-${r.status}`}>
                    <td className="qa-col-no">{r.no}</td>
                    <td className="qa-nowrap" title={dateTime(r.created_at)}>{shortTime(r.created_at)}</td>
                    <td><b>{r.name}</b><small>{r.phone ?? '—'} · {r.email}{r.user_id ? ' · 회원' : ''}</small></td>
                    <td>{r.depositor_name || r.name}</td>
                    {questions.map((qq) => <td key={qq.key} className="qa-nowrap">{r.answers?.[qq.key] ?? '—'}</td>)}
                    <td className="qa-nowrap">{[r.gender, r.age_group].filter(Boolean).join(' · ') || '—'}</td>
                    <td className="qa-nowrap"><AdminBadge value={r.status} label={STATUS_LABEL[r.status]} />{r.note && <small title={r.note}>{r.note}</small>}</td>
                    <td className="qa-col-actions"><span className="qa-actions">
                      {r.status === 'pending' && !full && <ActionButton label="입금 확인" onRun={setRegistrationStatus.bind(null, r.id, 'confirmed')} />}
                      {r.status === 'pending' && full && <span className="badge status-draft">정원 마감</span>}
                      {r.status === 'confirmed' && <ActionButton label="확인 취소" className="button small secondary" confirmText="입금 확인을 취소하고 대기 상태로 되돌릴까요? 모집 인원이 1명 줄어듭니다." onRun={setRegistrationStatus.bind(null, r.id, 'pending')} />}
                      {r.status !== 'cancelled' && <ActionButton label="신청 취소" className="button small ghost qa-danger" confirmText="이 신청을 취소 처리할까요?" onRun={setRegistrationStatus.bind(null, r.id, 'cancelled')} />}
                      {r.status === 'cancelled' && <ActionButton label="복구" className="button small secondary" onRun={setRegistrationStatus.bind(null, r.id, 'pending')} />}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="qa-empty"><i className="ri-inbox-2-line" aria-hidden="true"></i><p>{q ? `‘${q}’에 맞는 신청자가 없습니다.` : status ? `${STATUS_TABS.find(([v]) => v === status)?.[1]} 상태의 신청이 없습니다.` : '아직 신청자가 없습니다.'}</p>{(q || status) && <Link className="button small secondary" href={href({ q: '', status: '' })}>전체 보기</Link>}</div>
        )}
        <p className="qa-foot">{rows.length}명 표시 · 참여 확인 항목은 모두 동의해야 제출되므로 명단의 모든 신청자가 동의한 상태입니다. 개인정보는 행사 운영 목적으로만 사용하고 행사 종료 후 파기해주세요.</p>
      </section>
      <p className="qa-more"><Link href="/admin/campaigns?view=list">전체 캠페인 관리 <i className="ri-arrow-right-line" aria-hidden="true"></i></Link></p>
    </div>
  );
}

// 전체 캠페인 목록 (공개·숨기기, 신청 마감) — 필요할 때만 여는 보조 화면
function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="qa-roster">
      <header className="qa-head"><div className="qa-head-copy"><p className="qa-eyebrow">캠페인</p><h1>전체 캠페인</h1><p className="qa-meta">사이트 공개 여부와 행사 신청 접수를 관리합니다.</p></div></header>
      <section className="qa-board">
        {campaigns.length ? (
          <div className="data-table-wrap admin-table-scroll qa-table-wrap" tabIndex={0}>
            <table className="data-table qa-table"><thead><tr><th scope="col">캠페인</th><th scope="col">유형</th><th scope="col">기간</th><th scope="col">공개</th><th scope="col">모집 현황</th><th scope="col" className="qa-col-actions">처리</th></tr></thead>
              <tbody>{campaigns.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.title}</b><small>{c.partner_name}</small></td>
                  <td className="qa-nowrap">{campaignTypeNames[c.type] ?? c.type}</td>
                  <td className="qa-nowrap">{date(c.start_at)} ~ {date(c.end_at)}</td>
                  <td><AdminBadge value={c.review === 'approved' ? 'approved' : 'draft'} /></td>
                  <td className="qa-nowrap">{c.type === 'event' ? `입금 확인 ${c.confirmed_count ?? 0}${c.capacity != null ? ` / ${c.capacity}명` : '명'} · 신청 ${c.registrations ?? 0}명` : `응원 ${c.participations ?? 0}명`}</td>
                  <td className="qa-col-actions"><span className="qa-actions">
                    {c.type === 'event' && <Link className="button small primary" href={`/admin/campaigns?id=${c.id}`}>신청자 명단</Link>}
                    <ActionButton label={c.review === 'approved' ? '숨기기' : '공개'} className="button small secondary" onRun={setCampaignReview.bind(null, c.id, c.review === 'approved' ? 'draft' : 'approved')} />
                    <a className="button small ghost" href={`/campaigns/${c.slug}`} target="_blank" rel="noopener">보기</a>
                  </span></td>
                </tr>
              ))}</tbody></table>
          </div>
        ) : <div className="qa-empty"><i className="ri-inbox-2-line" aria-hidden="true"></i><p>등록된 캠페인이 없습니다.</p></div>}
      </section>
    </div>
  );
}
