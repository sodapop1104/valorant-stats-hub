export default function StatCard({ label, value, compact=false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={"card " + (compact ? "p-3" : "p-5")}>
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className={"font-bold " + (compact ? "text-base" : "text-2xl")}>{value}</div>
    </div>
  );
}
