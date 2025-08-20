"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TrendChart({ title, data, dataKey, tickFormat }:{ title:string; data:any[]; dataKey:string; tickFormat?:(n:number)=>string }) {
  return (
    <div className="card p-4">
      <div className="font-semibold mb-2">{title}</div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
            <XAxis dataKey="t" tick={{fontSize: 12}} />
            <YAxis tickFormatter={tickFormat} tick={{fontSize: 12}} />
            <Tooltip formatter={(v:any)=> tickFormat ? tickFormat(v) : v} />
            <Line type="monotone" dataKey={dataKey} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
