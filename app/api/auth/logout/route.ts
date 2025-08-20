import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  cookies().set("RSO_SESSION", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return NextResponse.redirect("/", { status: 302 });
}