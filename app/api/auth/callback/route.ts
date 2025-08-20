import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, getAccountMe, getActiveShard } from "@/lib/rso";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect("/", { status: 302 });

  try {
    const tokens = await exchangeCodeForTokens(code); // Bearer for /accounts/me
    const acct = await getAccountMe(tokens.access_token); // { puuid, gameName, tagLine }
    const shard = await getActiveShard(acct.puuid);

    // Keep session minimal: only what we need for stats fetch (no storing access_token).
    const session = {
      puuid: acct.puuid,
      gameName: acct.gameName,
      tagLine: acct.tagLine,
      shard,
      iat: Date.now(),
    };

    // httpOnly cookie (signed/encrypted storage would be even better; minimal here)
    cookies().set("RSO_SESSION", JSON.stringify(session), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.redirect(`/me`, { status: 302 });
  } catch (e: any) {
    return NextResponse.redirect(`/?authError=${encodeURIComponent(e?.message ?? "auth failed")}`, {
      status: 302,
    });
  }
}