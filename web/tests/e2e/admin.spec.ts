import { expect, test } from '@playwright/test';
import { openClean } from './helpers';

// 관리자 화면: 미리보기 모드에서는 로그인 없이 읽기 전용으로 열린다. 모든 메뉴가 오류 없이 열리고,
// 모바일에서도 가로로 넘치지 않는지 확인한다.
const pages = ['/admin', '/admin/campaigns', '/admin/campaigns?view=list', '/admin/campaigns/new', '/admin/content', '/admin/inquiries',
  '/admin/users', '/admin/logs', '/admin/settings', '/admin/moderation', '/admin/refunds', '/admin/organizations', '/admin/fundraisers',
  '/admin/donations', '/admin/recurring', '/admin/login'];

test.describe('관리자 화면', () => {
  for (const path of pages) {
    test(`${path} 가 오류 없이 열린다`, async ({ page }) => {
      const errors = await openClean(page, path);
      expect(errors).toEqual([]);
    });
  }

  test('신청자 명단: 상태 탭과 정렬 화살표가 주소에 반영된다', async ({ page }) => {
    await page.goto('/admin/campaigns');
    await page.locator('nav[aria-label="신청 상태"]').getByRole('link', { name: /입금 대기/ }).click();
    await expect(page).toHaveURL(/status=pending/);
    await expect(page.locator('nav[aria-label="신청 상태"] [aria-current="page"]')).toContainText('입금 대기');
    const nameSort = page.locator('th a.qa-sort', { hasText: '성함' });
    if (await nameSort.isVisible()) {
      await nameSort.click();
      await expect(page).toHaveURL(/sort=name/);
      await expect(page.locator('th[aria-sort="ascending"]')).toContainText('성함');
    } else {
      // 모바일: 표 머리글 대신 정렬 선택 상자
      const select = page.getByRole('combobox', { name: '정렬' });
      await select.selectOption({ label: '성함 · 오름차순' });
      await expect(page).toHaveURL(/sort=name/);
    }
  });
});
