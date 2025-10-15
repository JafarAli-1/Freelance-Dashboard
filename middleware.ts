import { NextResponse, type NextRequest } from "next/server";

// Basic route protection using presence of auth cookie set by Supabase
// For more robust SSR, prefer @supabase/ssr with createServerClient per request
export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;

  const isAuthRoute = pathname.startsWith("/login");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Supabase sets cookies starting with `sb-` for auth/session
  const hasSupabaseSession = cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  if (isDashboardRoute && !hasSupabaseSession) {
    const url = new URL("/", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasSupabaseSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
