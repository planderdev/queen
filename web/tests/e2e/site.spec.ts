import { expect, test } from '@playwright/test';
import { openClean } from './helpers';

const pages = ['/', '/campaigns', '/campaigns/salvation-run-2026', '/stories', '/support', '/support?view=notices', '/auth/login'];

test.describe('사이트 화면', () => {
  for (const path of pages) {
    test(`${path} 가 오류 없이 열린다`, async ({ page }) => {
      const errors = await openClean(page, path);
      expect(errors).toEqual([]);
    });
  }

  test('숨긴 메뉴(후원하기·사업안내·기관소개)가 헤더에 보이지 않는다', async ({ page, isMobile }) => {
    test.skip(isMobile, '모바일은 메뉴가 서랍 안에 있다');
    await page.goto('/');
    const nav = page.locator('header');
    for (const name of ['후원하기', '사업안내', '기관소개']) await expect(nav.getByText(name, { exact: true })).toHaveCount(0);
    await expect(nav.getByText('캠페인', { exact: true }).first()).toBeVisible();
  });

  test('홈 배너 첫 장이 기부런이다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main').getByText('기부런').first()).toBeVisible();
  });
});
