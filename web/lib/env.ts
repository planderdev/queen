// Runtime configuration. Without Supabase variables the app runs in seed mode: public pages render
// from lib/data/seed-data.mjs and every write shows a "database not connected" message. This lets
// the production UI be reviewed before the client's Supabase project is provisioned.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  demoUrl: process.env.NEXT_PUBLIC_DEMO_URL || '/demo/'
};
export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const DB_NOT_CONNECTED = '아직 데이터베이스가 연결되지 않아 저장할 수 없습니다. 운영팀이 연결을 마치면 다시 시도해주세요.';
