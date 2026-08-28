// ============================================================
// Nutri Atende — Next.js Middleware
// Handles auth protection and route redirects
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/api/anamneses/publico'];
  const isPublicRoute = publicRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
  );

  // API routes that need auth but handle it internally
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');

  const isSetupRoute = request.nextUrl.pathname === '/setup';

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Use admin client (service role) to check profile — bypasses RLS
  // Auth is already verified above via supabase.auth.getUser()
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Check if authenticated user has a profile (usuario_sistema)
  if (user && !isPublicRoute && !isApiRoute && !isSetupRoute) {
    const { data: profile } = await admin
      .from('usuario_sistema')
      .select('id')
      .eq('id', user.id)
      .single();

    // No profile → first-time user, go to setup
    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = '/setup';
      return NextResponse.redirect(url);
    }
  }

  // User with profile trying to access /setup → redirect to dashboard
  if (user && isSetupRoute) {
    const { data: profile } = await admin
      .from('usuario_sistema')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profile) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Pass user ID to downstream server components via header
  if (user) {
    response.headers.set('x-user-id', user.id);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
