// lib/regions.ts
// Map Riot taglines (after #) to the correct routing domains.

// ACCOUNT-V1 uses "americas" / "europe" / "asia" clusters
export function resolveAccountCluster(tag: string): "americas" | "europe" | "asia" {
  const t = tag.toUpperCase();
  if (["NA", "NA1", "BR", "LATAM"].includes(t)) return "americas";
  if (["EU", "EUW", "EUNE", "TR", "RU"].includes(t)) return "europe";
  if (["AP", "KR", "JP", "SEA", "OCE"].includes(t)) return "asia";
  return "americas";
}

// VALORANT match APIs use platform regions: na / eu / ap / kr / jp
export function resolveValorantRegion(tag: string): "na" | "eu" | "ap" | "kr" | "jp" {
  const t = tag.toUpperCase();
  if (["NA", "NA1", "BR", "LATAM"].includes(t)) return "na";
  if (["EU", "EUW", "EUNE", "TR", "RU"].includes(t)) return "eu";
  if (["KR"].includes(t)) return "kr";
  if (["JP"].includes(t)) return "jp";
  return "ap"; // default for AP/SEA/OCE
}