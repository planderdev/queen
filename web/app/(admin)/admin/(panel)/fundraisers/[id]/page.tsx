import { notFound } from 'next/navigation';
import { adminFundraiser, adminOrganizations } from '@/lib/data/admin';
import { repo } from '@/lib/data';
import { AdminTitle } from '@/components/admin/AdminUI';
import { ActionForm } from '@/components/site/ActionForm';
import { saveFundraiser } from '@/lib/actions/admin';

export const metadata = { title: '모금함 편집' };
const local = (iso?: string) => (iso ? new Date(new Date(iso).getTime() + 9 * 3600000).toISOString().slice(0, 16) : '');

export default async function FundraiserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === 'new';
  const [f, orgs, settings] = await Promise.all([isNew ? null : adminFundraiser(id), adminOrganizations(), repo.settings()]);
  if (!isNew && !f) notFound();
  const budget = f?.budget ?? [{ label: '물품 및 활동 지원', amount: 0 }, { label: '전달 및 운영 지원', amount: 0 }];
  return (
    <>
      <AdminTitle title={isNew ? '새 모금함' : '모금함 편집'} text="목표액과 사용 계획 합계는 같아야 합니다. 시작일이 지나고 승인·진행 중 상태일 때 사용자에게 공개됩니다." />
      <ActionForm action={saveFundraiser} className="editor-section" submitLabel="저장">
        {!isNew && <input type="hidden" name="id" value={f!.id} />}
        <label className="field"><span>제목 (줄바꿈은 그대로 표시)</span><textarea name="title" rows={2} defaultValue={f?.title} required /></label>
        <div className="field-grid">
          <label className="field"><span>단체</span><select name="organization_id" defaultValue={f?.organization_id ?? ''} required><option value="">선택</option>{orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
          <label className="field"><span>분야</span><select name="category" defaultValue={f?.category ?? settings.categories[0]}>{settings.categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className="field"><span>지역</span><select name="region" defaultValue={f?.region ?? '전국'}><option value="전국">전국</option>{settings.regions.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
          <label className="field"><span>슬러그 (URL)</span><input name="slug" defaultValue={f?.slug ?? ''} placeholder="비우면 제목에서 생성" /></label>
          <label className="field"><span>대표 이미지 URL</span><input name="image" defaultValue={f?.image ?? '/assets/images/meal.jpg'} /></label>
          <label className="field"><span>목표액 (원)</span><input name="target" inputMode="numeric" defaultValue={f?.target ?? ''} required /></label>
          <label className="field"><span>시작일시</span><input name="start_at" type="datetime-local" defaultValue={local(f?.start_at)} required /></label>
          <label className="field"><span>종료일시</span><input name="end_at" type="datetime-local" defaultValue={local(f?.end_at)} required /></label>
          <label className="field"><span>심사 상태</span><select name="review" defaultValue={f?.review ?? 'approved'}><option value="draft">임시저장</option><option value="submitted">검토 요청</option><option value="approved">승인</option><option value="rejected">반려</option></select></label>
          <label className="field"><span>게시 상태</span><select name="publication" defaultValue={f?.publication ?? 'active'}><option value="scheduled">예정</option><option value="active">진행 중</option><option value="paused">일시중지</option><option value="ended">종료</option></select></label>
        </div>
        <label className="field"><span>사연 (빈 줄로 문단 구분)</span><textarea name="story" rows={8} defaultValue={f?.story} required /></label>
        <div className="field-grid">
          {[0, 1, 2, 3].map((i) => <div className="field-grid" key={i} style={{ gridTemplateColumns: '2fr 1fr' }}><label className="field"><span>사용 계획 {i + 1}</span><input name={`budget_label_${i}`} defaultValue={budget[i]?.label ?? ''} /></label><label className="field"><span>금액</span><input name={`budget_amount_${i}`} inputMode="numeric" defaultValue={budget[i]?.amount ?? ''} /></label></div>)}
        </div>
      </ActionForm>
    </>
  );
}
