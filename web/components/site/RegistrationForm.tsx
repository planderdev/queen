import { ActionForm } from '@/components/site/ActionForm';
import { Field, Select } from '@/components/ui';
import { registerForCampaign } from '@/lib/actions/community';
import type { Campaign } from '@/lib/data/types';

const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대', '60대 이상'];

// 행사 캠페인 참가 신청서 — 원본 구글 폼의 항목(성함·연락처·성별·이메일·연령대·참여 확인·입금자명)을 그대로 옮겼다.
export function RegistrationForm({ campaign, defaults }: { campaign: Campaign; defaults?: { name?: string | null; email?: string | null } }) {
  const agreements = campaign.details.agreements ?? [];
  return (
    <ActionForm action={registerForCampaign} className="program-form" submitLabel="참가 신청하기" pendingLabel="신청 접수 중…" successPanel>
      <input type="hidden" name="campaign_id" value={campaign.id} />
      <div className="field-grid">
        <Field label="성함 *" name="name" defaultValue={defaults?.name ?? ''} required maxLength={50} autoComplete="name" placeholder="참가자 본인 성함" />
        <Field label="연락처" name="phone" type="tel" autoComplete="tel" placeholder="010-0000-0000" />
        <Field label="이메일 *" name="email" type="email" defaultValue={defaults?.email ?? ''} required autoComplete="email" placeholder="신청 확인을 받을 이메일" />
        <Select label="연령대" name="age_group" options={[['', '선택'], ...AGE_GROUPS.map((a): [string, string] => [a, a])]} />
      </div>
      <fieldset className="field">
        <legend>성별</legend>
        <div className="radio-group">
          <label><input type="radio" name="gender" value="남자" /> 남자</label>
          <label><input type="radio" name="gender" value="여자" /> 여자</label>
        </div>
      </fieldset>
      {agreements.length > 0 && (
        <fieldset className="field">
          <legend>기부런 참여 확인 *</legend>
          {agreements.map((text, i) => <label className="checkbox" key={i}><input type="checkbox" name={`agree_${i}`} required /> {text}</label>)}
        </fieldset>
      )}
      <Field label="참가비 입금자명" name="depositor_name" maxLength={50} help={campaign.fee_amount > 0 ? `참가비 ${campaign.fee_amount.toLocaleString('ko-KR')}원을 입금할 때 사용할 이름을 적어주세요.` : '참가비를 입금한(또는 입금할) 이름을 적어주세요. 신청자 성함과 다를 때만 필요합니다.'} />
      <p className="help">입력한 정보는 행사 운영과 참가 안내 목적으로만 사용하며 행사 종료 후 파기합니다.</p>
    </ActionForm>
  );
}
