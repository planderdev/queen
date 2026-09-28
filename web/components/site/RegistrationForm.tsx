import { ActionForm } from '@/components/site/ActionForm';
import { BankBox } from '@/components/site/BankBox';
import { ShareButton } from '@/components/site/ShareButton';
import { Field, Select } from '@/components/ui';
import { registerForCampaign } from '@/lib/actions/community';
import type { Campaign } from '@/lib/data/types';
import { AGE_GROUPS } from '@/lib/registration-rules';

// 행사 캠페인 참가 신청서 — 원본 구글 폼 항목(성함·연락처·성별·이메일·연령대·참여 확인·입금자명)에
// 캠페인별 추가 질문(details.questions, 예: 러닝 페이스·코스)을 더한다. 모든 항목이 필수이며 서버에서도 다시 확인한다.
export function RegistrationForm({ campaign, defaults }: { campaign: Campaign; defaults?: { name?: string | null; email?: string | null } }) {
  const { agreements = [], questions = [], bank } = campaign.details;
  return (
    <ActionForm action={registerForCampaign} className="program-form event-form" submitLabel="참가 신청하기" pendingLabel="신청 접수 중…" successPanel
      extraActions={<ShareButton label="공유하기" title={campaign.title} text="함께 달리고, 함께 나누는 기부런에 같이 참여해요!" />}
      successExtra={bank ? <BankBox bank={bank} fee={campaign.fee_amount} capacity={campaign.capacity} /> : undefined}>
      <input type="hidden" name="campaign_id" value={campaign.id} />
      <div className="field-grid">
        <Field label="성함 *" name="name" defaultValue={defaults?.name ?? ''} required maxLength={50} autoComplete="name" placeholder="참가자 본인 성함" />
        <Field label="연락처 *" name="phone" type="tel" required autoComplete="tel" inputMode="tel" pattern="0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}" title="010-0000-0000 형식으로 입력해주세요" placeholder="010-0000-0000" />
        <Field label="이메일 *" name="email" type="email" defaultValue={defaults?.email ?? ''} required autoComplete="email" placeholder="연락 가능한 이메일" />
        <Select label="연령대 *" name="age_group" required options={[['', '선택해주세요'], ...AGE_GROUPS.map((a): [string, string] => [a, a])]} />
      </div>
      <fieldset className="field">
        <legend>성별 *</legend>
        <div className="radio-group">
          <label><input type="radio" name="gender" value="남자" required /> 남자</label>
          <label><input type="radio" name="gender" value="여자" required /> 여자</label>
        </div>
      </fieldset>
      {questions.map((q) => (
        <fieldset className="field" key={q.key}>
          <legend>{q.label} *</legend>
          <div className="radio-group">
            {q.options.map((o) => <label key={o}><input type="radio" name={`q_${q.key}`} value={o} required /> {o}</label>)}
          </div>
        </fieldset>
      ))}
      {agreements.length > 0 && (
        <fieldset className="field">
          <legend>기부런 참여 확인 *</legend>
          {agreements.map((text, i) => <label className="checkbox" key={i}><input type="checkbox" name={`agree_${i}`} required /> {text}</label>)}
        </fieldset>
      )}
      <Field label="참가비 입금자명 *" name="depositor_name" required maxLength={50} help="통장에 찍히는 입금자 이름을 그대로 적어주세요. 입금 확인에 사용합니다." />
      {bank && <p className="help">참가비{campaign.fee_amount > 0 ? ` ${campaign.fee_amount.toLocaleString('ko-KR')}원` : ''}은 {bank.bank} {bank.account} (예금주 {bank.holder})로 입금해주세요. 신청 후 화면에서도 다시 안내합니다.</p>}
      <fieldset className="field privacy-consent">
        <legend>개인정보 수집·이용 동의 *</legend>
        <label className="checkbox"><input type="checkbox" name="privacy_consent" required /> [필수] 행사 참가 신청을 위한 개인정보 수집·이용에 동의합니다.</label>
        <details>
          <summary>내용 보기</summary>
          <dl>
            <div><dt>수집 항목</dt><dd>성함, 연락처, 이메일, 성별, 연령대, {[...questions.map((q) => q.short ?? q.label), '참가비 입금자명'].join(', ')}</dd></div>
            <div><dt>이용 목적</dt><dd>행사 참가 신청 접수, 참가비 입금 확인과 참가 확정, 행사 운영 및 참가 안내 연락</dd></div>
            <div><dt>보유 기간</dt><dd>행사 종료 후 지체 없이 파기합니다.</dd></div>
            <div><dt>처리 위탁·국외 보관</dt><dd>신청 정보는 Supabase(데이터 저장)와 Vercel(웹 서비스 운영)을 통해 처리되며, 일본 도쿄 지역 서버에 보관됩니다.</dd></div>
            <div><dt>동의 거부 권리</dt><dd>동의를 거부할 수 있으며, 거부하시면 참가 신청을 할 수 없습니다.</dd></div>
          </dl>
          <p><a href="/support?view=privacy" target="_blank" rel="noopener">개인정보처리방침 전체 보기</a></p>
        </details>
      </fieldset>
    </ActionForm>
  );
}
