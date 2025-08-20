import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const data = await req.formData();
  const pass = data.get("p")?.toString() || "";
  if (process.env.SITE_PASSWORD && pass === process.env.SITE_PASSWORD) {
    // ✅ set a simple flag instead of storing the password
    cookies().set("site-unlocked", "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 12, // 12h
      sameSite: "lax",
      secure: true,
    });
  }
  return NextResponse.redirect(new URL("/", req.url));
}