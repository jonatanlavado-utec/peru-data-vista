import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getBenchmark } from "@/lib/api";
import type { BenchmarkPoint } from "@/lib/types";

const COLORS = ["#00f0ff", "#ff00a0", "#00ff66", "#ffce3a", "#9d6dff", "#ff7a59"];

const BenchmarkPage = () => {
  const [data, setData] = useState<BenchmarkPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Bench.Lab — AmazonPe";
    (async () => {
      const d = await getBenchmark();
      setData(d);
      setLoading(false);
    })();
  }, []);

  // Transform into shared-x line series for latency comparison
  const latencySeries = Array.from({ length: 12 }).map((_, x) => {
    const point: Record<string, number> = { x };
    data.forEach((d) => {
      const s = d.series.find((p) => p.x === x);
      if (s) point[d.structure] = s.latency;
    });
    return point;
  });

  const barData = data.map((d) => ({
    name: d.structure,
    exec: d.execMs,
    mem: d.memMb,
  }));

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Bench<span className="text-warning">.</span>Lab
        </h2>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {`> compare --structures=trie,btree,cms,bloom,pq,lsm`}
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-bark border border-edge/60 p-4 h-80 animate-shimmer" />
          ))}
        </div>
      ) : (
        <>
          {/* Metric tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {data.map((d, i) => (
              <div key={d.structure} className="bg-bark border border-edge/60 p-3 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ backgroundColor: COLORS[i] }}
                />
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
                  {d.structure}
                </div>
                <div className="text-lg font-mono mt-1 tabular-nums" style={{ color: COLORS[i] }}>
                  {d.execMs}ms
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-1">
                  {d.memMb}MB · {d.throughput.toLocaleString()}/s
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Latency lines */}
            <div className="bg-bark border border-edge/60 p-4">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-sm font-medium">Latency over time</h3>
                <span className="text-[10px] font-mono text-muted-foreground">ms / op</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={latencySeries}>
                  <CartesianGrid stroke="hsl(var(--edge))" strokeDasharray="2 4" />
                  <XAxis dataKey="x" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--bark))",
                      border: "1px solid hsl(var(--edge))",
                      fontFamily: "JetBrains Mono",
                      fontSize: 11,
                    }}
                  />
                  <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                  {data.map((d, i) => (
                    <Line
                      key={d.structure}
                      type="monotone"
                      dataKey={d.structure}
                      stroke={COLORS[i]}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div className="bg-bark border border-edge/60 p-4">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-sm font-medium">Exec time vs memory</h3>
                <span className="text-[10px] font-mono text-muted-foreground">ms · MB</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid stroke="hsl(var(--edge))" strokeDasharray="2 4" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={9}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--bark))",
                      border: "1px solid hsl(var(--edge))",
                      fontFamily: "JetBrains Mono",
                      fontSize: 11,
                    }}
                  />
                  <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                  <Bar dataKey="exec" fill="#00f0ff" name="exec ms" />
                  <Bar dataKey="mem" fill="#ff00a0" name="mem MB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BenchmarkPage;
