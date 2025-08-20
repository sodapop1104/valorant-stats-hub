import { NextResponse } from "next/server";
import { rsoAuthorizeUrl } from "@/lib/rso";

export async function GET() {
  return NextResponse.redirect(rsoAuthorizeUrl(), { status: 302 });
}