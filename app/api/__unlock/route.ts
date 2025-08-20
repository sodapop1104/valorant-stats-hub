// app/api/__unlock/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const data = await req.formData();
  const pass = data.get("p")?.toString() || "";
  if (pass && process.env.SITE_PASSWORD && pass === process.env.SITE_PASSWORD) {
    cookies().set("site-pass", pass, { httpOnly: true, path: "/", maxAge: 60 * 60 * 12 });
  }
  return NextResponse.redirect(new URL("/", req.url));
}
