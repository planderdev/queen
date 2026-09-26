import { ActionForm } from '@/components/site/ActionForm';
import { BankBox } from '@/components/site/BankBox';
import { Field, Select } from '@/components/ui';
import { registerForCampaign } from '@/lib/actions/community';
import type { Campaign } from '@/lib/data/types';

const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대', '60대 이상'];

// 행사 캠페인 참가 신청서 — 원본 구글 폼 항목(성함·연락처·성별·이메일·연령대·참여 확인·입금자명)에
// 캠페인별 추가 질문(details.questions, 예: 러닝 페이스·코스)을 더한다. 모든 항목이 필수이며 서버에서도 다시 확인한다.
export function RegistrationForm({ campaign, defaults }: { campaign: Campaign; defaults?: { name?: string | null; email?: string | null } }) {
  const { agreements = [], questions = [], bank } = campaign.details;
  return (
    <ActionForm action={registerForCampaign} className="program-form" submitLabel="참가 신청하기" pendingLabel="신청 접수 중…" successPanel
      successExtra={bank ? <BankBox bank={bank} fee={campaign.fee_amount} capacity={campaign.capacity} /> : undefined}>
      <input type="hidden" name="campaign_id" value={campaign.id} />
      <div className="field-grid">
        <Field label="성함 *" name="name" defaultValue={defaults?.name ?? ''} required maxLength={50} autoComplete="name" placeholder="참가자 본인 성함" />
        <Field label="연락처 *" name="phone" type="tel" required autoComplete="tel" inputMode="tel" pattern="0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}" title="010-0000-0000 형식으로 입력해주세요" placeholder="010-0000-0000" />
        <Field label="이메일 *" name="email" type="email" defaultValue={defaults?.email ?? ''} required autoComplete="email" placeholder="신청 확인을 받을 이메일" />
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
      <p className="help">입력한 정보는 행사 운영과 참가 안내 목적으로만 사용하며 행사 종료 후 파기합니다.</p>
    </ActionForm>
  );
}
