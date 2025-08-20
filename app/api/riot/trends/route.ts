import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CLUSTERS = ["americas", "europe", "asia"] as const;
const VAL_SHARDS = ["na","eu","ap","kr","latam","br","jp"] as const;

async function riotGet<T>(url: string) {
  const res = await fetch(url, { headers: { "X-Riot-Token": process.env.RIOT_API_KEY! }, next: { revalidate: 300 }});
  if (!res.ok) throw new Error(`Riot ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function toPuuidFromRiotId(riotId: string): Promise<{ puuid: string; cluster: string }> {
  const [nameRaw, tagRaw] = riotId.split("#");
  const name = nameRaw?.trim();
  const tag = tagRaw?.trim();
  if (!name || !tag) throw new Error("Use Riot ID like GameName#Tag");

  for (const c of CLUSTERS) {
    try {
      const acct = await riotGet<{ puuid: string }>(
        `https://${c}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
      );
      return { puuid: acct.puuid, cluster: c };
    } catch {}
  }
  throw new Error("Account not found for that Riot ID");
}

async function activeShardFor(puuid: string, hintCluster?: string): Promise<string> {
  const order = hintCluster
    ? [hintCluster, ...CLUSTERS.filter((x) => x !== hintCluster)]
    : [...CLUSTERS];

  for (const c of order) {
    try {
      const dto: any = await riotGet(
        `https://${c}.api.riotgames.com/riot/account/v1/active-shards/by-game/val/by-puuid/${puuid}`
      );
      const shard = dto?.activeShard ?? dto?.active_shard ?? dto?.shard;
      if (shard && VAL_SHARDS.includes(shard)) return shard;
    } catch {}
  }
  return "na";
}

type Pt = { t: string; kd?: number; hs?: number; win?: number };

export async function POST(req: Request) {
  try {
    const reqBody: any = await req.json().catch(() => ({}));
    const sessionRaw = cookies().get("RSO_SESSION")?.value;
    const session = sessionRaw ? JSON.parse(sessionRaw) : null;

    // 1) Find the PUUID
    let puuid: string | undefined = session?.puuid ?? reqBody?.puuid;
    let hintCluster: string | undefined;

    if (!puuid && reqBody?.riotId) {
      const out = await toPuuidFromRiotId(String(reqBody.riotId));
      puuid = out.puuid;
      hintCluster = out.cluster;
    }

    if (!puuid) {
      return NextResponse.json({ error: "Missing puuid (sign in or pass a riotId/puuid)" }, { status: 400 });
    }

    // 2) Shard
    let shard: string | undefined = session?.shard;
    if (!shard) shard = await activeShardFor(puuid, hintCluster);
    if (!VAL_SHARDS.includes(shard as any)) shard = "na";

    // 3) Matchlist (403 → soft response)
    let matchlist: any;
    try {
      matchlist = await riotGet(`https://${shard}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`);
    } catch (e:any) {
      if (String(e).includes("403")) {
        return NextResponse.json({
          kd: [], hs: [], win: [], puuid, shard,
          notice: "API key not approved for VAL match history. Login works; request production/partner access."
        });
      }
      throw e;
    }

    const ids = (matchlist.history ?? []).slice(0, 16).map((h: any) => h.matchId).reverse();

    // 4) Build time series
    const kd: Pt[] = [], hs: Pt[] = [], win: Pt[] = [];
    let i=1;
    for (const id of ids) {
      try {
        const match:any = await riotGet(`https://${shard}.api.riotgames.com/val/match/v1/matches/${id}`);
        const players = match?.players?.allPlayers ?? match?.players?.data ?? match?.players ?? [];
        const me = Array.isArray(players) ? players.find((p:any)=>p.puuid===puuid) : undefined;
        if (!me) { i++; continue; }

        const st = me.stats ?? me.playerStats ?? me;
        const k=st.kills??0, d=st.deaths??0;
        const hsC=st.headshots ?? st.headShots ?? 0;
        const bsC=st.bodyshots ?? st.bodyShots ?? 0;
        const lsC=st.legshots  ?? st.legShots  ?? 0;
        const shots = hsC+bsC+lsC;

        const myTeam = me.teamId ?? me.team;
        const teams = match?.teams?.data ?? match?.teams ?? [];
        const t = Array.isArray(teams) ? teams.find((x:any)=>
          (x.teamId ?? x.team)?.toString().toUpperCase()===myTeam?.toString().toUpperCase()
        ) : undefined;

        kd.push({ t: `M${i}`, kd: d>0 ? k/d : k });
        hs.push({ t: `M${i}`, hs: shots>0 ? hsC/shots : 0 });
        win.push({ t: `M${i}`, win: (t?.won===true || t?.hasWon===true) ? 1 : 0 });
        i++;
      } catch { i++; }
    }

    return NextResponse.json({ kd, hs, win, puuid, shard });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
  }
}