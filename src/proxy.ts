import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "./config/supabase-server-config";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // if route is private , but session is not valid, redirect to login
  const pathname = request.nextUrl.pathname;
  const isPrivate =
    pathname.startsWith("/user") || pathname.startsWith("/admin");

  const session = await supabase.auth.getSession();

  if (isPrivate && !session.data.session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // if route is public, but if user is trying to access login or signup page, redirect to role/dashboard
  const role = request.cookies.get("role")?.value;
  const isPublic = !isPrivate;
  if (session.data.session && isPublic) {
    const redirectUrl = new URL(`/${role}/dashboard`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};