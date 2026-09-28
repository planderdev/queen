import { defineConfig, devices } from '@playwright/test';

// 화면 자동 점검. 데이터베이스 없이(미리보기 모드, 예시 데이터) 운영과 같은 빌드를 띄워 확인한다.
// 실제 DB 규칙(신청·입금 확인·정원·파기·권한)은 supabase/tests에서 따로 점검한다.
const PORT = 3100;
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, locale: 'ko-KR', timezoneId: 'Asia/Seoul', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    // .env.local이 있어도 데이터베이스 연결을 끈다 (빈 값이 우선한다)
    env: { NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_ANON_KEY: '', NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}` }
  }
});
