import Link from 'next/link';
import { adminCounts, adminDonations, adminInquiries, adminLogs, adminPendingRegistrations, adminReports } from '@/lib/data/admin';
import { money, dateTime } from '@/lib/format';
import { AdminTitle, AdminBadge } from '@/components/admin/AdminUI';
import { hasSupabase } from '@/lib/env';

// 운영 대시보드 — 데모(/demo/admin)의 구성을 실제 데이터로 옮긴 화면
export default async function AdminDashboard() {
  const [counts, pending, registrations, inquiries, reports, logs] = await Promise.all([adminCounts(), adminDonations({ status: 'pending' }), adminPendingRegistrations(), adminInquiries(), adminReports(), adminLogs()]);
  const tiles: [string, number, string, string][] = [
    ['행사 입금 대기', counts.pendingRegistrations, `campaigns${registrations[0]?.campaign ? `?id=${registrations[0].campaign.id}&status=pending` : ''}`, 'run-line'],
    ['기부 입금 대기', counts.pendingDonations, 'donations?status=pending', 'receipt-line'],
    ['모금함 심사 대기', counts.reviewFundraisers, 'fundraisers', 'hand-heart-line'],
    ['환불 처리 대기', counts.refunds, 'refunds', 'refund-2-line'],
    ['미답변 문의', counts.inquiries, 'inquiries', 'mail-unread-line'],
    ['신고 검토 대기', counts.reports, 'moderation', 'flag-line']
  ];
  const openReports = reports.filter((r) => r.status === 'requested');
  return (
    <>
      <AdminTitle title="운영 대시보드" text="오늘 처리할 업무를 한눈에 확인하세요.">{!hasSupabase ? <span className="badge status-pending">미리보기 모드</span> : <a className="button small secondary" href="/" target="_blank" rel="noopener">사이트로 이동</a>}</AdminTitle>
      <section className="admin-work-summary" aria-label="처리할 업무">
        {tiles.map(([label, count, href, icon]) => <Link key={label} href={`/admin/${href}`}><i className={`ri-${icon}`} aria-hidden="true"></i><span>{label}</span><strong>{count}</strong></Link>)}
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-dashboard-section"><h2>행사 참가 입금 대기 <Link href="/admin/campaigns">전체 보기</Link></h2>
          {registrations.length ? <ul>{registrations.map((r) => <li key={r.id}><Link href={`/admin/campaigns?id=${r.campaign?.id ?? ''}&status=pending`}><span>{r.name} · 입금자 {r.depositor_name || r.name}</span><small>{r.campaign?.title ?? '행사'}</small></Link><span className="admin-feed-meta"><AdminBadge value={r.status} /><time>{dateTime(r.created_at)}</time></span></li>)}</ul> : <p className="muted">입금 확인을 기다리는 참가 신청이 없습니다.</p>}
        </section>
        <section className="admin-dashboard-section"><h2>기부 입금 대기 <Link href="/admin/donations?status=pending">전체 보기</Link></h2>
          {pending.length ? <ul>{pending.slice(0, 6).map((d) => <li key={d.id}><Link href="/admin/donations?status=pending"><span>{d.depositor_name} · {money(d.amount)}</span><small>{d.fundraiser?.title.replace(/\n/g, ' ') ?? d.organization?.name}</small></Link><span className="admin-feed-meta"><AdminBadge value={d.status} /><time>{dateTime(d.created_at)}</time></span></li>)}</ul> : <p className="muted">입금 확인을 기다리는 기부가 없습니다.</p>}
        </section>
        <section className="admin-dashboard-section"><h2>최근 문의 <Link href="/admin/inquiries">전체 보기</Link></h2>
          {inquiries.length ? <ul>{inquiries.slice(0, 6).map((q) => <li key={q.id}><Link href={`/admin/inquiries?answer=${q.id}`}><span>{q.title}</span><small>{q.profile?.name ?? q.email} · {q.category}</small></Link><span className="admin-feed-meta">{q.answer ? <span className="badge status-approved">답변 완료</span> : <span className="badge status-pending">미답변</span>}<time>{dateTime(q.created_at)}</time></span></li>)}</ul> : <p className="muted">접수된 문의가 없습니다.</p>}
        </section>
        <section className="admin-dashboard-section"><h2>최근 신고 <Link href="/admin/moderation">전체 보기</Link></h2>
          {openReports.length ? <ul>{openReports.slice(0, 6).map((r) => <li key={r.id}><Link href="/admin/moderation"><span>{r.comment?.body ?? '삭제된 댓글'}</span><small>신고 사유 · {r.reason}</small></Link><span className="admin-feed-meta"><span className="badge status-received">검토 대기</span><time>{dateTime(r.created_at)}</time></span></li>)}</ul> : <p className="muted">검토할 신고가 없습니다.</p>}
        </section>
      </div>
      <section className="admin-dashboard-section"><h2>최근 운영 이력 <Link href="/admin/logs">전체 보기</Link></h2>
        {logs.length ? <ul>{logs.slice(0, 8).map((l) => <li key={l.id}><Link href="/admin/logs">{l.action}</Link><time>{dateTime(l.created_at)}</time></li>)}</ul> : <p className="muted">아직 기록된 작업이 없습니다.</p>}
      </section>
    </>
  );
}
