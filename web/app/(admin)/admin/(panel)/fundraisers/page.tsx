import Link from 'next/link';
import { adminFundraisers } from '@/lib/data/admin';
import { money, date, flatTitle } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';

export const metadata = { title: '모금함 관리' };

export default async function AdminFundraisersPage() {
  const rows = await adminFundraisers();
  return (
    <>
      <AdminTitle title="모금함 관리" text="모금함을 등록·수정하고 심사·게시 상태를 관리합니다."><Link className="button small primary" href="/admin/fundraisers/new">새 모금함</Link></AdminTitle>
      <AdminTable headers={['모금함 / 단체', '분야', '목표', '기간', '심사 / 게시', '작업']} rows={rows.map((f) => [
        <><b>{flatTitle(f.title)}</b><small>{f.organization?.name}</small></>, f.category, money(f.target), `${date(f.start_at)} ~ ${date(f.end_at)}`,
        <><AdminBadge value={f.review} /> <AdminBadge value={f.publication} /></>,
        <div className="actions"><Link className="button small" href={`/admin/fundraisers/${f.id}`}>수정</Link><a className="button small secondary" href={`/donate/${f.slug}`} target="_blank" rel="noopener">보기</a></div>
      ])} empty="등록된 모금함이 없습니다." />
    </>
  );
}
