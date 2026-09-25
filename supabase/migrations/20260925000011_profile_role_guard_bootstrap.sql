-- 권한 필드 보호 트리거 보정: 앱 API로 들어온 방문자·회원(anon/authenticated) 요청만 막는다.
-- 이전 정의는 JWT가 없는 직접 DB 세션(SQL Editor·마이그레이션)까지 막아 README의 "첫 관리자 지정" SQL이 동작하지 않았다.
-- 직접 DB 세션은 이미 DB 자격 증명을 가진 운영자만 열 수 있으므로 허용한다.
create or replace function public.guard_profile_role()
returns trigger language plpgsql set search_path = public as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated')
     and not public.is_admin()
     and (new.role is distinct from old.role or new.admin_role is distinct from old.admin_role or new.suspended is distinct from old.suspended) then
    raise exception '권한 필드는 관리자만 변경할 수 있습니다.';
  end if;
  return new;
end $$;
