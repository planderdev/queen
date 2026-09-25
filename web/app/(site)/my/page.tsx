import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import { repo } from '@/lib/data';
import { myBookmarks, myDonations, myInquiries, myNotifications, myPlans, myRefunds, myRegistrations } from '@/lib/data/me';
import { BankBox } from '@/components/site/BankBox';
import { money, date, dateTime, kindNames } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { Area, Cards, Empty, Field, Notice, Select, State, Table, Tabs } from '@/components/ui';
import { ActionForm } from '@/components/site/ActionForm';
import { updateProfile } from '@/lib/actions/community';
import { requestRefund } from '@/lib/actions/donation';
import { DonationActions, PlanActions, SignOutButton } from '@/components/site/MyActions';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: '나의 후원' };
const views: [string, string][] = [['summary', '나의 나눔'], ['donations', '기부 내역'], ['monthly', '정기기부'], ['bookmarks', '관심 모금'], ['events', '행사 신청'], ['inquiries', '문의 내역'], ['notifications', '알림'], ['profile', '프로필']];

export default async function MyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const session = await getSession();
  if (!session) redirect('/auth/login?next=/my');
  const view = views.some(([v]) => v === sp.view) ? sp.view! : 'summary';
  const uid = session.user.id;
  let body: React.ReactNode = null;
  if (view === 'summary') {
    const [txs, plans, marks] = await Promise.all([myDonations(uid), myPlans(uid), myBookmarks(uid)]);
    const success = txs.filter((d) => d.status === 'success');
    const net = success.reduce((a, d) => a + (d.kind === 'refund' ? -d.amount : d.amount), 0);
    const pending = txs.filter((d) => d.status === 'pending');
    body = (
      <>
        {sp.denied === 'admin' && <Notice>운영 관리 화면은 관리자 계정만 사용할 수 있습니다.</Notice>}
        <div className="stat-grid">
          <div className="stat"><span>내가 전한 마음</span><strong>{money(net)}</strong><small>입금 확인된 기부 − 완료된 환불</small></div>
          <div className="stat"><span>함께한 나눔</span><strong>{success.filter((d) => d.kind !== 'refund').length}회</strong></div>
          <div className="stat"><span>꾸준한 약속</span><strong>{plans.filter((p) => p.status === 'active').length}개</strong><small>정기기부 약정</small></div>
          <div className="stat"><span>마음에 담은 이야기</span><strong>{marks.length}개</strong></div>
        </div>
        {pending.length > 0 && <Notice>입금 확인을 기다리는 기부 신청이 {pending.length}건 있어요. 안내된 계좌로 입금하면 운영팀이 확인합니다. <Link href="/my?view=donations">기부 내역 보기</Link></Notice>}
        <div className="panel"><h2>작은 마음, 차곡차곡</h2><p>내역과 결과보고를 통해 내가 전한 마음의 다음 이야기를 확인하세요.</p><div className="actions"><Link className="button primary" href="/my?view=donations">기부 내역 보기</Link><Link className="button secondary" href="/donate">새로운 이야기 만나기</Link></div></div>
      </>
    );
  }
  if (view === 'donations') {
    const [txs, refunds, settings] = await Promise.all([myDonations(uid, { status: sp.status, from: sp.from, to: sp.to }), myRefunds(uid), repo.settings()]);
    const refundOf = (id: string) => refunds.find((r) => r.donation_id === id && r.status !== 'rejected');
    body = (
      <>
        <form className="filters" action="/my"><input type="hidden" name="view" value="donations" />
          <Field label="시작일" name="from" type="date" defaultValue={sp.from ?? ''} /><Field label="종료일" name="to" type="date" defaultValue={sp.to ?? ''} />
          <Select label="상태" name="status" options={[['', '전체'], ['pending', '입금 확인 대기'], ['success', '성공'], ['cancelled', '취소'], ['failed', '실패']]} defaultValue={sp.status ?? ''} />
          <button className="button secondary">조회</button><a className="button secondary" href={`/api/my/donations.csv?${new URLSearchParams(Object.entries({ status: sp.status ?? '', from: sp.from ?? '', to: sp.to ?? '' }).filter(([, v]) => v))}`}>CSV 다운로드</a>
        </form>
        {txs.some((d) => d.status === 'pending') && <div className="transfer-box"><span>입금 계좌</span><b>{settings.bank.bank} {settings.bank.account}</b><span>예금주 {settings.bank.holder} · 입금자명은 신청 시 입력한 이름과 같게</span></div>}
        <Table headers={['일시', '모금함 / 거래', '금액', '상태', '처리']} rows={txs.map((d) => [
          dateTime(d.created_at),
          <><b>{d.fundraiser ? d.fundraiser.title.replace(/\n/g, ' ') : d.organization?.name ?? '정기기부'}</b><small style={{ display: 'block' }}>{kindNames[d.kind]} · {d.number}{d.anonymous ? ' · 익명' : ''}</small></>,
          (d.kind === 'refund' ? '-' : '') + money(d.amount),
          <><State value={d.status} />{refundOf(d.id) && <small style={{ display: 'block' }}>환불 {refundOf(d.id)!.status === 'requested' ? '요청 접수' : '승인'}</small>}</>,
          <DonationActions id={d.id} status={d.status} kind={d.kind} refundOpen={Boolean(refundOf(d.id))} confirmedAt={d.confirmed_at} />
        ])} empty={<Empty title="아직 기부 내역이 없어요" text="마음이 닿는 이야기를 찾아 첫 나눔을 시작해보세요." />} />
        {sp.refund && <div className="panel"><h2>환불 요청</h2><ActionForm action={requestRefund} submitLabel="환불 요청 접수" reset><input type="hidden" name="donation_id" value={sp.refund} /><Area label="환불 사유" name="reason" required maxLength={500} placeholder="환불이 필요한 이유를 알려주세요." /></ActionForm></div>}
      </>
    );
  }
  if (view === 'monthly') {
    const [plans, settings] = await Promise.all([myPlans(uid), repo.settings()]);
    body = (
      <>
        {sp.created && <Notice>정기기부 약정을 등록했습니다. 매달 약정일에 아래 계좌로 이체해주세요.</Notice>}
        <div className="transfer-box"><span>정기기부 입금 계좌</span><b>{settings.bank.bank} {settings.bank.account}</b><span>예금주 {settings.bank.holder}</span></div>
        {plans.length ? plans.map((p) => (
          <div className="panel" key={p.id}>
            <div className="section-head"><h2>{p.organization?.name}</h2><State value={p.status} /></div>
            <div className="check-row"><span>월 약정액 / 결제일</span><strong>{money(p.amount)} / 매월 {p.day}일</strong></div>
            <div className="check-row"><span>다음 결제 예정일</span><strong>{p.status === 'cancelled' ? '해지됨' : date(p.next_date)}</strong></div>
            <PlanActions id={p.id} status={p.status} amount={p.amount} />
          </div>
        )) : <Empty title="아직 정기기부 약정이 없어요" text="매달 이어지는 마음으로 더 오래 함께해요." cta={false} />}
        <Link className="button secondary" href="/monthly">정기기부 프로그램 보기</Link>
      </>
    );
  }
  if (view === 'bookmarks') {
    const marks = await myBookmarks(uid);
    const fundIds = marks.filter((b) => b.target_type === 'fundraiser').map((b) => b.target_id);
    const funds = (await Promise.all(fundIds.map((id) => repo.getFundraiser(id)))).filter((f): f is NonNullable<typeof f> => Boolean(f));
    const storyIds = marks.filter((b) => b.target_type === 'story').map((b) => b.target_id);
    const stories = (await Promise.all(storyIds.map((id) => repo.getContent(id)))).filter((s): s is NonNullable<typeof s> => Boolean(s));
    body = (
      <>
        <Cards items={funds} savedIds={fundIds} />
        {stories.length > 0 && <div className="section"><h2>관심 나눔 이야기</h2><ul>{stories.map((s) => <li key={s.id}><Link href={`/stories/${s.slug ?? s.id}`}>{s.title}</Link></li>)}</ul></div>}
      </>
    );
  }
  if (view === 'events') {
    const list = await myRegistrations(uid);
    body = list.length ? (
      <>
        {list.map((r) => (
          <section className="panel" key={r.id}>
            <h2>{r.campaign ? <Link href={`/campaigns/${r.campaign.slug}`}>{r.campaign.title}</Link> : '행사'} <State value={r.status} /></h2>
            <p>신청일 {dateTime(r.created_at)} · {r.name}{r.depositor_name ? ` · 입금자명 ${r.depositor_name}` : ''}{(r.campaign?.details.questions ?? []).map((q) => r.answers?.[q.key] ? ` · ${q.short ?? q.label} ${r.answers[q.key]}` : '').join('')}</p>
            {r.status === 'pending' && r.campaign?.details.bank && <BankBox bank={r.campaign.details.bank} fee={r.campaign.fee_amount} capacity={null} />}
            {r.status === 'confirmed' && <p>참가비 입금이 확인되어 참가가 확정되었습니다. 행사 당일 뵙겠습니다.</p>}
          </section>
        ))}
        <Notice>신청 내용 변경·취소는 1:1 문의로 알려주세요. 로그인하지 않고 신청한 내역은 이곳에 표시되지 않습니다.</Notice>
      </>
    ) : <Empty title="아직 행사 신청 내역이 없어요" text="진행 중인 캠페인에서 행사에 참가 신청해보세요." cta={false} />;
  }
  if (view === 'inquiries') {
    const list = await myInquiries(uid);
    body = <><Link className="button primary" href="/support?view=inquiry">새 문의 작성</Link><Table headers={['접수일', '문의', '상태', '답변']} rows={list.map((x) => [date(x.created_at), <><b>{x.title}</b><small style={{ display: 'block' }}>{x.category}</small></>, x.answer ? '답변 완료' : '접수', x.answer ?? '검토 중입니다.'])} empty={<Empty title="아직 문의 내역이 없어요" text="궁금한 점은 1:1 문의로 남겨주세요." cta={false} />} /></>;
  }
  if (view === 'notifications') {
    const list = await myNotifications(uid);
    body = list.length ? list.map((n) => <div className="panel" key={n.id}><span className="help">{dateTime(n.created_at)}</span><p style={{ margin: 'var(--space-8) 0 0' }}>{n.href ? <Link href={n.href}>{n.text}</Link> : n.text}</p></div>) : <Empty title="새로운 알림이 없습니다" cta={false} />;
  }
  if (view === 'profile') {
    const settings = await repo.settings();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    body = (
      <>
        <ActionForm action={updateProfile} className="panel" submitLabel="프로필 저장">
          <Field label="닉네임" name="name" defaultValue={session.profile.name} required maxLength={20} />
          <Field label="이메일" name="email_display" defaultValue={user?.email ?? ''} readOnly />
          <Select label="관심 분야" name="interest" options={[['', '선택 안 함'], ...settings.categories.map((c) => [c, c] as [string, string])]} defaultValue={session.profile.interests[0] ?? ''} />
          <label className="checkbox"><input type="checkbox" name="public" defaultChecked={session.profile.is_public} /> 참여 내역과 댓글에 닉네임 공개</label>
        </ActionForm>
        <div className="actions"><Link className="button secondary" href="/auth/update-password">비밀번호 변경</Link><SignOutButton /></div>
      </>
    );
  }
  return (
    <>
      <PageBanner page="my" />
      <div className="container">
        <Tabs items={views.map(([v, t]) => [v, t, v === 'summary' ? '/my' : `/my?view=${v}`])} current={view} />
        {body}
      </div>
    </>
  );
}
