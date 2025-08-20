// lib/rso.ts
const AUTH_BASE = "https://auth.riotgames.com";
const CLUSTERS = ["americas", "europe", "asia"] as const;

type TokenResponse = {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  token_type: "Bearer" | string;
  expires_in: number;
};

export function rsoAuthorizeUrl() {
  const p = new URL(`${AUTH_BASE}/authorize`);
  p.searchParams.set("client_id", process.env.RSO_CLIENT_ID!);
  p.searchParams.set("redirect_uri", process.env.RSO_REDIRECT_URI!);
  p.searchParams.set("response_type", "code");
  // You can add scopes Riot enables for your client; baseline is openid + offline_access
  p.searchParams.set("scope", "openid offline_access");
  return p.toString();
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", process.env.RSO_REDIRECT_URI!);
  body.set("client_id", process.env.RSO_CLIENT_ID!);
  body.set("client_secret", process.env.RSO_CLIENT_SECRET!);

  const res = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`RSO token exchange failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getUserInfo(accessToken: string) {
  const res = await fetch(`${AUTH_BASE}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`userinfo failed: ${res.status} ${await res.text()}`);
  return res.json(); // typically { sub, ... } (fields may vary)
}

export async function getAccountMe(accessToken: string) {
  // /riot/account/v1/accounts/me can be called on any cluster; try americas→europe→asia
  // (this maps the RSO subject to { puuid, gameName, tagLine }).
  for (const c of CLUSTERS) {
    const url = `https://${c}.api.riotgames.com/riot/account/v1/accounts/me`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (res.ok) return res.json();
    // some accounts may 404/500 intermittently; try the next cluster. :contentReference[oaicite:2]{index=2}
  }
  throw new Error("Could not resolve account from RSO token");
}

export async function getActiveShard(puuid: string) {
  // use your server key to map PUUID → VAL shard (na/eu/ap/…)
  for (const c of CLUSTERS) {
    const url = `https://${c}.api.riotgames.com/riot/account/v1/active-shards/by-game/val/by-puuid/${puuid}`;
    const res = await fetch(url, { headers: { "X-Riot-Token": process.env.RIOT_API_KEY! } });
    if (res.ok) {
      const dto = await res.json();
      return dto?.activeShard || dto?.active_shard || dto?.shard || "na";
    }
  }
  return "na";
}