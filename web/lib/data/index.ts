import { hasSupabase } from '@/lib/env';
import { memoryRepo } from './memory';
import { supabaseRepo } from './supabase';

// One repository object for pages. Seed mode is read-only; see lib/env.ts.
export const repo = hasSupabase ? supabaseRepo : memoryRepo;
export type Repo = typeof supabaseRepo | typeof memoryRepo;
export * from './types';
export { canDonate, total } from './shared';
