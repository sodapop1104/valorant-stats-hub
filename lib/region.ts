// Rough mapping from taglines (after #) → routing
// account-v1 uses clusters: americas/europe/asia
// val-* uses platform routing: na, eu, ap, kr, jp
export function resolveAccountCluster(tag: string): "americas" | "europe" | "asia" {
  const t = tag.toUpperCase();
  if (["NA", "NA1", "BR", "LATAM"].includes(t)) return "americas";
  if (["EU", "EUW", "EUNE", "TR", "RU"].includes(t)) return "europe";
  if (["AP", "KR", "JP", "SEA", "OCE"].includes(t)) return "asia";
  return "americas";
}

export function resolveValorantRegion(tag: string): "na" | "eu" | "ap" | "kr" | "jp" {
  const t = tag.toUpperCase();
  if (["NA", "NA1", "BR", "LATAM"].includes(t)) return "na";
  if (["EU", "EUW", "EUNE", "TR", "RU"].includes(t)) return "eu";
  if (["KR"].includes(t)) return "kr";
  if (["JP"].includes(t)) return "jp";
  return "ap"; // AP/SEA/OCE default
}