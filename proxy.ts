import { NextResponse, type NextRequest } from "next/server";
import { AUTH_TOKEN_KEY } from "@/lib/auth-token";

const protectedRoutes = ["/", "/create"];
const publicOnlyRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const isBrokerDetailRoute = pathname.startsWith("/broker/");
  const isProtectedRoute =
    protectedRoutes.includes(pathname) || isBrokerDetailRoute;
  const isPublicOnlyRoute = publicOnlyRoutes.includes(pathname);

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (isPublicOnlyRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/create", "/broker/:path*", "/login", "/register"],
};
