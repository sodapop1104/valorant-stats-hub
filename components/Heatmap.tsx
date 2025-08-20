export default function Heatmap({ title, data }:{ title:string; data:number[][] }) {
  return (
    <div className="card p-4">
      <div className="font-semibold mb-2">{title}</div>
      <div className="grid grid-cols-10 gap-1">
        {data.flatMap((row, i)=> row.map((v, j)=> (
          <div key={i+"-"+j} className="w-6 h-6 rounded" style={{ background: `rgba(10,200,185, ${v})` }} />
        )))}
      </div>
    </div>
  );
}
