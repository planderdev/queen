import { expect, type Page } from '@playwright/test';

// 페이지를 열고, 서버 오류·자바스크립트 오류가 없는지와 가로 스크롤이 생기지 않는지 확인한다.
export async function openClean(page: Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`${path}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push(`${path}: ${m.text()}`); });
  const res = await page.goto(path, { waitUntil: 'load' });
  expect(res?.status(), `${path} 응답 코드`).toBeLessThan(400);
  await expect(page.locator('body')).not.toContainText('Application error');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `${path} 가로 넘침(px)`).toBeLessThanOrEqual(1);
  return errors;
}
