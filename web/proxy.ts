import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refreshes the Supabase session cookie on every request and guards /my and /admin.
// In seed mode (no Supabase env) protected areas redirect to the login page, which explains the state.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  const adminLogin = pathname === '/admin/login';
  const adminArea = pathname === '/admin' || (pathname.startsWith('/admin/') && !adminLogin);
  const protectedArea = pathname.startsWith('/my') || adminArea || pathname.includes('/checkout');
  let response = NextResponse.next({ request });
  if (!url || !key) {
    // Seed (preview) mode: member areas need a database; the admin UI stays viewable read-only.
    if (protectedArea && !pathname.startsWith('/admin')) return NextResponse.redirect(new URL(`/auth/login?next=${encodeURIComponent(pathname + request.nextUrl.search)}`, request.url));
    return response;
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  const { data: { user } } = await supabase.auth.getUser();
  // 관리자 영역은 사이트 로그인이 아니라 관리자 로그인(/admin/login)으로 보낸다
  const next = encodeURIComponent(pathname + request.nextUrl.search);
  if (!user && protectedArea) {
    return NextResponse.redirect(new URL(adminArea ? `/admin/login?next=${next}` : `/auth/login?next=${next}`, request.url));
  }
  if (user && adminArea) {
    const { data: profile } = await supabase.from('profiles').select('role, suspended').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin' || profile.suspended) return NextResponse.redirect(new URL('/admin/login?denied=1', request.url));
  }
  return response;
}

export const proxyConfig = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|demo/|design-system/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)']
};
