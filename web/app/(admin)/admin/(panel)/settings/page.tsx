import { repo } from '@/lib/data';
import { AdminTitle } from '@/components/admin/AdminUI';
import { ActionForm } from '@/components/site/ActionForm';
import { saveSettings } from '@/lib/actions/admin';

export const metadata = { title: '분야·지역·계좌 설정' };

export default async function AdminSettingsPage() {
  const s = await repo.settings();
  return (
    <>
      <AdminTitle eyebrow="설정" title="분야·지역·계좌 설정" text="입금 계좌는 기부 신청 화면과 나의 후원에 그대로 표시됩니다." />
      <ActionForm action={saveSettings} className="editor-section" submitLabel="설정 저장">
        <label className="field"><span>분야 (쉼표로 구분)</span><textarea name="categories" rows={2} defaultValue={s.categories.join(', ')} required /></label>
        <label className="field"><span>지역 (쉼표로 구분)</span><textarea name="regions" rows={2} defaultValue={s.regions.join(', ')} required /></label>
        <div className="field-grid">
          <label className="field"><span>은행</span><input name="bank_name" defaultValue={s.bank.bank} required /></label>
          <label className="field"><span>계좌번호</span><input name="bank_account" defaultValue={s.bank.account} required /></label>
          <label className="field"><span>예금주</span><input name="bank_holder" defaultValue={s.bank.holder} required /></label>
        </div>
      </ActionForm>
    </>
  );
}
