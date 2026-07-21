import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Temporary gate for the internal admin panel — HTTP Basic Auth via env
// credentials. This is intentionally minimal; it will be replaced by proper
// authentication when the full admin panel is built.
export function proxy(request: NextRequest) {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return new NextResponse("Admin panel is not configured (missing ADMIN_USERNAME/ADMIN_PASSWORD).", {
      status: 503,
    });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);
    if (user === expectedUser && pass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="THE RARESKIN Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
