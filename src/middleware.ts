import middleware from "next-auth/middleware";
import { NextRequest } from "next/server";

export default function authMiddleware(req: NextRequest) {
  return (middleware as any)(req);
}

export const config = {
  matcher: ["/dashboard/:path*", "/accounts/:path*", "/transactions/:path*"],
};
