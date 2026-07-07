import { NextResponse } from "next/server";

// Single shared site password for early testing - no user accounts, no email.
// Change it here (or set SITE_PASSWORD in the environment to override without a
// code change). This value only lives on the server; it is never sent to the
// browser. To lift the gate entirely, remove the check in src/proxy.ts.
const DEFAULT_PASSWORD = "fintralobe";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const sitePassword = process.env.SITE_PASSWORD || DEFAULT_PASSWORD;

    if (password === sitePassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("site_access", "granted", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Incorrect password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
