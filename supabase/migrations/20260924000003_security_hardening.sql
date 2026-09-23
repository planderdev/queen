-- Supabase advisor 조치: 뷰는 조회자 권한으로, 함수 search_path 고정, 트리거 함수는 API에서 호출 불가
alter view public.fundraiser_stats set (security_invoker = true);
-- 집계 뷰가 조회자 권한으로 동작하도록 승인된 지원금·지급 완료 내역은 공개 읽기 허용 (개인정보 없음)
create policy "public approved matching" on public.matching_contributions for select using (status = 'approved');
create policy "public paid payouts" on public.payouts for select using (status = 'paid');

alter function public.touch_updated_at() set search_path = public;
alter function public.fundraiser_is_public(public.fundraisers) set search_path = public;
alter function public.guard_profile_role() set search_path = public;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
