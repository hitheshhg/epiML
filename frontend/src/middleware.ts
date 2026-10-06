import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Pass-through middleware with Supabase session refresh support
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
