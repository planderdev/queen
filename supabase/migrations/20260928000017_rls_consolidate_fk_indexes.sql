-- DB 성능: RLS 정책을 테이블·동작마다 하나로 합치고(조건은 OR로 동일하게 유지),
-- auth.uid()·is_admin()을 (select …)로 감싸 쿼리당 한 번만 평가되게 한다. 외래 키 인덱스 23개 추가.
-- 이전 정책 이름을 모두 지운 뒤 새 이름(<table>_select/insert/update/delete 또는 <table>_all)으로 만든다.
do $d$ declare r record; begin
  for r in select tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $d$;

create policy audit_logs_all on public.audit_logs for all using ((select private.is_admin())) with check ((select private.is_admin()));

create policy bookmarks_all on public.bookmarks for all using ((select private.is_admin()) or user_id = (select auth.uid())) with check ((select private.is_admin()) or user_id = (select auth.uid()));

create policy notifications_all on public.notifications for all using ((select private.is_admin()) or user_id = (select auth.uid())) with check ((select private.is_admin()) or user_id = (select auth.uid()));

create policy participations_all on public.participations for all using ((select private.is_admin()) or user_id = (select auth.uid())) with check ((select private.is_admin()) or user_id = (select auth.uid()));

create policy recurring_plans_all on public.recurring_plans for all using ((select private.is_admin()) or user_id = (select auth.uid())) with check ((select private.is_admin()) or user_id = (select auth.uid()));

create policy campaign_registrations_select on public.campaign_registrations for select using ((select private.is_admin()) or user_id = (select auth.uid()));
create policy campaign_registrations_insert on public.campaign_registrations for insert with check ((select private.is_admin()) or (email is not null and status = 'pending'::public.registration_status and note is null and (user_id is null or user_id = (select auth.uid())) and exists (select 1 from public.campaigns c where c.id = campaign_registrations.campaign_id and c.type = 'event'::public.campaign_type and c.review = 'approved'::public.review_status and c.registration_open and now() < c.end_at and (c.capacity is null or c.confirmed_count < c.capacity))));
create policy campaign_registrations_update on public.campaign_registrations for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy campaign_registrations_delete on public.campaign_registrations for delete using ((select private.is_admin()));

create policy campaigns_select on public.campaigns for select using ((select private.is_admin()) or review = 'approved'::public.review_status);
create policy campaigns_insert on public.campaigns for insert with check ((select private.is_admin()));
create policy campaigns_update on public.campaigns for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy campaigns_delete on public.campaigns for delete using ((select private.is_admin()));

create policy comment_reports_select on public.comment_reports for select using ((select private.is_admin()));
create policy comment_reports_insert on public.comment_reports for insert with check ((select private.is_admin()) or user_id = (select auth.uid()));
create policy comment_reports_update on public.comment_reports for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy comment_reports_delete on public.comment_reports for delete using ((select private.is_admin()));

create policy comments_select on public.comments for select using ((select private.is_admin()) or user_id = (select auth.uid()) or not hidden);
create policy comments_insert on public.comments for insert with check ((select private.is_admin()) or user_id = (select auth.uid()));
create policy comments_update on public.comments for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy comments_delete on public.comments for delete using ((select private.is_admin()));

create policy content_select on public.content for select using ((select private.is_admin()) or published);
create policy content_insert on public.content for insert with check ((select private.is_admin()));
create policy content_update on public.content for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy content_delete on public.content for delete using ((select private.is_admin()));

create policy donations_select on public.donations for select using ((select private.is_admin()) or user_id = (select auth.uid()) or status = 'success'::public.donation_status);
create policy donations_insert on public.donations for insert with check ((select private.is_admin()) or (user_id = (select auth.uid()) and status = 'pending'::public.donation_status and kind = any (array['donation'::public.donation_kind, 'recurring'::public.donation_kind])));
create policy donations_update on public.donations for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy donations_delete on public.donations for delete using ((select private.is_admin()));

create policy fundraisers_select on public.fundraisers for select using ((select private.is_admin()) or public.fundraiser_is_public(fundraisers.*));
create policy fundraisers_insert on public.fundraisers for insert with check ((select private.is_admin()));
create policy fundraisers_update on public.fundraisers for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy fundraisers_delete on public.fundraisers for delete using ((select private.is_admin()));

create policy impact_reports_select on public.impact_reports for select using ((select private.is_admin()) or status = 'approved'::public.review_status);
create policy impact_reports_insert on public.impact_reports for insert with check ((select private.is_admin()));
create policy impact_reports_update on public.impact_reports for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy impact_reports_delete on public.impact_reports for delete using ((select private.is_admin()));

create policy inquiries_select on public.inquiries for select using ((select private.is_admin()) or user_id = (select auth.uid()));
create policy inquiries_insert on public.inquiries for insert with check ((select private.is_admin()) or user_id = (select auth.uid()) or (user_id is null and email is not null));
create policy inquiries_update on public.inquiries for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy inquiries_delete on public.inquiries for delete using ((select private.is_admin()));

create policy matching_contributions_select on public.matching_contributions for select using ((select private.is_admin()) or status = 'approved'::public.request_status);
create policy matching_contributions_insert on public.matching_contributions for insert with check ((select private.is_admin()));
create policy matching_contributions_update on public.matching_contributions for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy matching_contributions_delete on public.matching_contributions for delete using ((select private.is_admin()));

create policy organizations_select on public.organizations for select using ((select private.is_admin()) or status = 'approved'::public.review_status);
create policy organizations_insert on public.organizations for insert with check ((select private.is_admin()));
create policy organizations_update on public.organizations for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy organizations_delete on public.organizations for delete using ((select private.is_admin()));

create policy payouts_select on public.payouts for select using ((select private.is_admin()) or status = 'paid'::public.payout_status);
create policy payouts_insert on public.payouts for insert with check ((select private.is_admin()));
create policy payouts_update on public.payouts for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy payouts_delete on public.payouts for delete using ((select private.is_admin()));

create policy profiles_select on public.profiles for select using ((select private.is_admin()) or id = (select auth.uid()));
create policy profiles_insert on public.profiles for insert with check ((select private.is_admin()));
create policy profiles_update on public.profiles for update using ((select private.is_admin()) or id = (select auth.uid())) with check ((select private.is_admin()) or id = (select auth.uid()));
create policy profiles_delete on public.profiles for delete using ((select private.is_admin()));

create policy refund_requests_select on public.refund_requests for select using ((select private.is_admin()) or user_id = (select auth.uid()));
create policy refund_requests_insert on public.refund_requests for insert with check ((select private.is_admin()) or user_id = (select auth.uid()));
create policy refund_requests_update on public.refund_requests for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy refund_requests_delete on public.refund_requests for delete using ((select private.is_admin()));

create policy settings_select on public.settings for select using (true);
create policy settings_insert on public.settings for insert with check ((select private.is_admin()));
create policy settings_update on public.settings for update using ((select private.is_admin())) with check ((select private.is_admin()));
create policy settings_delete on public.settings for delete using ((select private.is_admin()));

-- 외래 키 인덱스 (조인·삭제 시 전체 스캔 방지)
create index if not exists audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index if not exists campaign_registrations_user_id_idx on public.campaign_registrations (user_id);
create index if not exists campaigns_fundraiser_id_idx on public.campaigns (fundraiser_id);
create index if not exists comment_reports_comment_id_idx on public.comment_reports (comment_id);
create index if not exists comment_reports_user_id_idx on public.comment_reports (user_id);
create index if not exists comments_user_id_idx on public.comments (user_id);
create index if not exists content_created_by_idx on public.content (created_by);
create index if not exists content_fundraiser_id_idx on public.content (fundraiser_id);
create index if not exists donations_original_id_idx on public.donations (original_id);
create index if not exists donations_plan_id_idx on public.donations (plan_id);
create index if not exists donations_organization_id_idx on public.donations (organization_id);
create index if not exists donations_confirmed_by_idx on public.donations (confirmed_by);
create index if not exists fundraisers_organization_id_idx on public.fundraisers (organization_id);
create index if not exists impact_reports_fundraiser_id_idx on public.impact_reports (fundraiser_id);
create index if not exists inquiries_answered_by_idx on public.inquiries (answered_by);
create index if not exists matching_contributions_fundraiser_id_idx on public.matching_contributions (fundraiser_id);
create index if not exists matching_contributions_donation_id_idx on public.matching_contributions (donation_id);
create index if not exists participations_user_id_idx on public.participations (user_id);
create index if not exists payouts_fundraiser_id_idx on public.payouts (fundraiser_id);
create index if not exists recurring_plans_organization_id_idx on public.recurring_plans (organization_id);
create index if not exists refund_requests_user_id_idx on public.refund_requests (user_id);
create index if not exists refund_requests_donation_id_idx on public.refund_requests (donation_id);
create index if not exists refund_requests_reviewed_by_idx on public.refund_requests (reviewed_by);
