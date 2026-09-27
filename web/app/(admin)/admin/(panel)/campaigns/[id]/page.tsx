import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminCampaigns } from '@/lib/data/admin';
import { AdminTitle } from '@/components/admin/AdminUI';
import { ActionForm } from '@/components/site/ActionForm';
import { saveCampaign } from '@/lib/actions/admin';

export const metadata = { title: '캠페인 편집' };
// DB 시각(UTC ISO) → datetime-local 입력값(한국 시간)
const local = (iso?: string) => (iso ? new Date(new Date(iso).getTime() + 9 * 3600000).toISOString().slice(0, 16) : '');

// 행사 캠페인 편집·등록. 저장하면 사이트 캠페인 상세·목록·홈 배너에 바로 반영된다.
export default async function CampaignEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === 'new';
  const c = isNew ? null : (await adminCampaigns()).find((x) => x.id === id) ?? null;
  if (!isNew && !c) notFound();
  const d = c?.details ?? {};
  const questions = (d.questions ?? []).map((q) => `${q.label} | ${q.options.join(', ')}`).join('\n');
  return (
    <>
      <AdminTitle eyebrow="캠페인·참가 신청" title={isNew ? '새 행사 캠페인' : '캠페인 편집'} text="저장하면 사이트의 캠페인 상세·목록·홈 배너에 바로 반영됩니다. 이미 받은 신청은 그대로 유지됩니다.">
        {c && <Link className="button small secondary" href={`/admin/campaigns?id=${c.id}`}>신청자 명단</Link>}
        {c && <a className="button small ghost" href={`/campaigns/${c.slug}`} target="_blank" rel="noopener">사이트에서 보기 <i className="ri-external-link-line" aria-hidden="true"></i></a>}
      </AdminTitle>
      <ActionForm action={saveCampaign} className="editor-section qa-editor" submitLabel={isNew ? '캠페인 등록' : '저장'}>
        {c && <input type="hidden" name="id" value={c.id} />}

        <h2 className="qa-form-title">기본 정보</h2>
        <label className="field"><span>캠페인 제목</span><input name="title" defaultValue={c?.title ?? ''} required maxLength={80} placeholder="[우리도 오늘은 구세군] 기부런" /></label>
        <label className="field"><span>한 줄 소개 (목록 카드·공유 문구)</span><textarea name="description" rows={2} defaultValue={c?.description ?? ''} maxLength={200} /></label>
        <div className="field-grid">
          <label className="field"><span>함께하는 곳</span><input name="partner_name" defaultValue={c?.partner_name ?? ''} placeholder="예: 아식스 구제주 칠성점 × 제주야미소영" /></label>
          <label className="field"><span>주소 (슬러그)</span><input name="slug" defaultValue={c?.slug ?? ''} placeholder="비우면 제목에서 생성" pattern="[a-z0-9가-힣\-]+" /></label>
          <label className="field"><span>대표 이미지 경로</span><input name="image" defaultValue={c?.image ?? '/assets/images/community.jpg'} /></label>
          <label className="field"><span>사이트 공개</span><select name="review" defaultValue={c?.review === 'approved' ? 'approved' : 'draft'}><option value="approved">공개</option><option value="draft">숨김</option></select></label>
        </div>
        {c?.image && <img className="qa-image-preview" src={c.image} alt="현재 대표 이미지" width={320} height={180} />}

        <h2 className="qa-form-title">모집 설정</h2>
        <div className="field-grid">
          <label className="field"><span>신청 시작 (한국 시간)</span><input name="start_at" type="datetime-local" defaultValue={local(c?.start_at)} required /></label>
          <label className="field"><span>신청 마감 (한국 시간)</span><input name="end_at" type="datetime-local" defaultValue={local(c?.end_at)} required /></label>
          <label className="field"><span>정원 (입금 확인 기준, 비우면 제한 없음)</span><input name="capacity" inputMode="numeric" defaultValue={c?.capacity ?? ''} placeholder="50" /></label>
          <label className="field"><span>참가비 (원, 0이면 무료)</span><input name="fee_amount" inputMode="numeric" defaultValue={c?.fee_amount ?? 0} /></label>
        </div>
        <label className="checkbox"><input type="checkbox" name="registration_open" defaultChecked={c ? c.registration_open : true} /> 참가 신청 받기 (끄면 정원과 관계없이 신청 마감)</label>
        {c && c.capacity != null && <p className="qa-help">현재 입금 확인 {c.confirmed_count ?? 0}명 · 정원을 이보다 작게 할 수는 없습니다.</p>}

        <h2 className="qa-form-title">행사 안내 (캠페인 상세 페이지)</h2>
        <label className="field"><span>소개 글 (줄바꿈 그대로 표시)</span><textarea name="intro" rows={6} defaultValue={d.intro ?? ''} /></label>
        <div className="field-grid">
          <label className="field"><span>행사명</span><input name="event_name" defaultValue={d.event_name ?? ''} /></label>
          <label className="field"><span>일시</span><input name="schedule" defaultValue={d.schedule ?? ''} placeholder="2026년 10월 10일 (토) 08:00 ~ 10:00" /></label>
        </div>
        <label className="field"><span>코스·장소</span><input name="course" defaultValue={d.course ?? ''} /></label>
        <label className="field"><span>참가자 혜택 (한 줄에 하나, 첫 줄은 굵게)</span><textarea name="benefits" rows={5} defaultValue={(d.benefits ?? []).join('\n')} /></label>

        <h2 className="qa-form-title">신청서</h2>
        <label className="field"><span>추가 질문 (한 줄에 하나: 질문 | 보기1, 보기2, …) — 모두 필수</span><textarea name="questions" rows={3} defaultValue={questions} placeholder={'평소 러닝 페이스 (1km당) | 3~4분대, 4~5분대, 5~6분대\n코스 선택 | 10km 완주, 5km 완주'} /></label>
        <p className="qa-help">성함·연락처·이메일·연령대·성별·입금자명은 항상 받습니다. 질문 순서를 바꾸면 이미 받은 답변이 다른 질문에 연결되니, 순서는 유지하고 끝에 추가해주세요.</p>
        <label className="field"><span>참여 확인 항목 (한 줄에 하나, 모두 체크해야 제출)</span><textarea name="agreements" rows={3} defaultValue={(d.agreements ?? []).join('\n')} /></label>
        <label className="field"><span>신청 완료 문구</span><textarea name="complete" rows={4} defaultValue={d.complete ?? ''} /></label>

        <h2 className="qa-form-title">참가비 입금 계좌</h2>
        <div className="field-grid qa-grid-3">
          <label className="field"><span>은행</span><input name="bank_bank" defaultValue={d.bank?.bank ?? ''} /></label>
          <label className="field"><span>계좌번호</span><input name="bank_account" defaultValue={d.bank?.account ?? ''} /></label>
          <label className="field"><span>예금주</span><input name="bank_holder" defaultValue={d.bank?.holder ?? ''} /></label>
        </div>

        <h2 className="qa-form-title">홈 메인 배너</h2>
        <p className="qa-help">제목을 입력하면 신청 마감일까지 홈 배너 첫 장에 노출됩니다. 모집 중에는 잔여석, 마감 후에는 ‘모집 마감’ 문구가 자동으로 붙습니다. 비우면 배너에 올리지 않습니다.</p>
        <div className="field-grid">
          <label className="field"><span>배너 제목 (두 줄)</span><textarea name="hero_heading" rows={2} defaultValue={(d.hero?.heading ?? []).join('\n')} placeholder={'함께 달리고,\n함께 나누는 하루.'} /></label>
          <label className="field"><span>배너 설명 (한 줄에 하나)</span><textarea name="hero_description" rows={2} defaultValue={(d.hero?.description ?? []).join('\n')} /></label>
        </div>
        <label className="field"><span>배너 버튼 문구 (모집 중일 때)</span><input name="hero_cta" defaultValue={d.hero?.cta ?? ''} placeholder="참가 신청하기" /></label>
      </ActionForm>
    </>
  );
}
