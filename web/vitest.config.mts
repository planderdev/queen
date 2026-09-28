import path from 'node:path';
import { defineConfig } from 'vitest/config';

// 순수 규칙 점검(tests/unit). 화면 점검은 Playwright(tests/e2e), DB 점검은 supabase/tests.
export default defineConfig({
  resolve: { alias: { '@': import.meta.dirname } },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' }
});
