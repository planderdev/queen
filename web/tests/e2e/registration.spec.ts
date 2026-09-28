import { expect, test } from '@playwright/test';

// 기부런 참가 신청서: 모든 항목을 채워야 제출되고, 채우면 서버까지 전달된다.
// 미리보기 모드에서는 저장 대신 "데이터베이스 연결 전" 안내가 돌아오는 것으로 서버 도달을 확인한다.
test.describe('참가 신청서', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/campaigns/salvation-run-2026');
    const form = page.locator('#register form');
    test.skip((await form.count()) === 0, '예시 데이터의 기부런 모집이 끝나 신청서가 없다');
  });

  test('빈 칸이 있으면 제출되지 않는다', async ({ page }) => {
    const form = page.locator('#register form');
    await form.getByRole('button', { name: /신청/ }).click();
    expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(false);
    await expect(page.locator('.form-error')).toHaveText('');
    // 필수 항목: 성함·연락처·이메일·연령대·성별·질문 2개·참여 확인·입금자명·개인정보 동의
    const invalid = await form.evaluate((f: HTMLFormElement) => new Set([...f.querySelectorAll<HTMLInputElement>(':invalid')].map((el) => el.name)).size);
    expect(invalid).toBeGreaterThanOrEqual(10);
  });

  test('모두 채우면 서버로 제출된다', async ({ page }) => {
    const form = page.locator('#register form');
    await form.locator('[name=name]').fill('점검 참가자');
    await form.locator('[name=phone]').fill('010-1234-5678');
    await form.locator('[name=email]').fill('runner@test.invalid');
    await form.locator('[name=age_group]').selectOption('30대');
    await form.locator('[name=gender][value="여자"]').check();
    for (const group of await form.locator('input[type=radio][name^="q_"]').evaluateAll((els) => [...new Set(els.map((e) => (e as HTMLInputElement).name))])) {
      await form.locator(`input[name="${group}"]`).first().check();
    }
    for (const box of await form.locator('input[type=checkbox]').all()) await box.check();
    await form.locator('[name=depositor_name]').fill('점검 참가자');
    expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(true);
    await form.getByRole('button', { name: /신청/ }).click();
    await expect(page.locator('.form-error')).toContainText('데이터베이스가 연결되지 않아');
  });
});
