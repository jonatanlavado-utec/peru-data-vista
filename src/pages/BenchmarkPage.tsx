import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getBenchmarkComparisons } from "@/lib/api";
import type { BenchmarkComparison } from "@/lib/types";

// Semantic colors respecting the app theme
const COLOR_OPT = "hsl(var(--primary))";
const COLOR_BASE = "hsl(var(--destructive))";

const formatX = (n: number) => {
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  if (n >= 1_000) return `${n / 1_000}k`;
  return `${n}`;
};

const formatY = (v: number) => `${v.toFixed(2)}ms`;

interface ComparisonChartProps {
  comparison: BenchmarkComparison;
}

// Find and replace the ComparisonChart component in BenchmarkPage.tsx

const ComparisonChart = ({ comparison }: ComparisonChartProps) => {
  const [opt, base] = comparison.series;
  
  // Check if we are plotting Time or Memory
  const isMemory = comparison.metric === "memory";
  const metricKey = isMemory ? "memory" : "time";
  const unit = isMemory ? "MB" : "ms";

  const data = useMemo(() => {
    if (!opt || !base || !opt.points) return [];
    
    return opt.points.map((p, i) => ({
      x: p.x,
      // dynamically pull the correct key based on the metric type
      [opt.label]: p[metricKey as keyof typeof p] || 0,
      [base.label]: base.points[i]?.[metricKey as keyof typeof p] || 0,
    }));
  }, [comparison, opt, base, metricKey]);

  if (!data.length) return null;

  const formatY = (v: number) => `${v.toFixed(2)} ${unit}`;

  return (
    <div className="bg-bark border border-edge/60 p-5 flex flex-col gap-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium text-foreground">{comparison.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{comparison.description}</p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--edge))" vertical={false} />
            <XAxis dataKey="x" tickFormatter={formatX} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatY} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--bark-light))", borderColor: "hsl(var(--edge))" }}
              labelFormatter={(val) => `N = ${val.toLocaleString()}`}
              formatter={(value: number) => [`${value.toFixed(3)} ${unit}`]}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Line type="monotone" dataKey={opt.label} stroke={COLOR_OPT} strokeWidth={2} dot={{ r: 4, fill: COLOR_OPT, strokeWidth: 0 }} />
            <Line type="monotone" dataKey={base.label} stroke={COLOR_BASE} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: COLOR_BASE, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-x-auto rounded border border-edge/60">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-muted-foreground bg-bark-light border-b border-edge/60">
            <tr>
              <th className="p-2 font-medium">Size (N)</th>
              <th className="p-2 font-medium text-primary">{opt.label}</th>
              <th className="p-2 font-medium text-destructive">{base.label}</th>
              <th className="p-2 font-medium text-right">Speedup</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge/40">
            {data.map((row, i) => {
              const optVal = row[opt.label] as number;
              const baseVal = row[base.label] as number;
              
              // If Memory, less is better. If Time, less is better. 
              // Multiplier calculation works the same for both!
              const speedup = optVal > 0 ? (baseVal / optVal).toFixed(1) : "0.0";

              return (
                <tr key={i} className="hover:bg-bark-light/50 transition-colors">
                  <td className="p-2 text-foreground">{row.x.toLocaleString()}</td>
                  <td className="p-2">{optVal.toFixed(4)} {unit}</td>
                  <td className="p-2">{baseVal.toFixed(4)} {unit}</td>
                  <td className="p-2 text-right text-success">{speedup}x</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BenchmarkPage = () => {
  const [comparisons, setComparisons] = useState<BenchmarkComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        setLoading(true);
        const data = await getBenchmarkComparisons();
        setComparisons(data);
      } catch (err: any) {
        setError(err.message || "Failed to load benchmarks. Ensure /init has been run.");
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmarks();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <header>
        <h2 className="text-3xl font-light tracking-tight text-foreground">
          Scaling<span className="text-warning">.</span>Lab
        </h2>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {`> compare --optimized=[bloom,bptree,cms,pq,trie] --baseline=naive`}
        </p>
        
        {/* Legend Map */}
        <div className="mt-4 flex items-center gap-6 text-[11px] font-mono bg-bark-light p-3 rounded border border-edge/60 inline-flex">
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-1 bg-primary rounded-full" />
            <span className="text-foreground">Optimized Structure O(log n) / O(1)</span>
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-1 rounded-full"
              style={{
                background: "repeating-linear-gradient(90deg, hsl(var(--destructive)) 0 3px, transparent 3px 6px)",
              }}
            />
            <span className="text-foreground">Unoptimized Baseline O(n)</span>
          </span>
        </div>
      </header>

      {error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded font-mono text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-bark border border-edge/60 h-[500px] animate-shimmer rounded"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comparisons.map((comp) => (
            <ComparisonChart key={comp.id} comparison={comp} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BenchmarkPage;