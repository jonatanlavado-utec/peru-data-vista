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

// Semantic color hooks → defined in tailwind/index.css design tokens.
// We reference them via CSS variables so the chart respects the theme.
const COLOR_OPT = "hsl(var(--primary))";
const COLOR_BASE = "hsl(var(--destructive))";

type Metric = "time" | "memory";

const formatX = (n: number) => {
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  if (n >= 1_000) return `${n / 1_000}k`;
  return `${n}`;
};

const formatY = (metric: Metric) => (v: number) =>
  metric === "time" ? `${v.toFixed(2)}ms` : `${v.toFixed(1)}MB`;

interface ComparisonChartProps {
  comparison: BenchmarkComparison;
  metric: Metric;
}

const ComparisonChart = ({ comparison, metric }: ComparisonChartProps) => {
  const data = useMemo(() => {
    const [opt, base] = comparison.series;
    return opt.points.map((p, i) => ({
      x: p.x,
      [opt.label]: metric === "time" ? p.timeMs : p.memMb,
      [base.label]: metric === "time" ? base.points[i].timeMs : base.points[i].memMb,
    }));
  }, [comparison, metric]);

  const [optKey, baseKey] = [comparison.series[0].label, comparison.series[1].label];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="hsl(var(--edge))" strokeDasharray="2 4" />
        <XAxis
          dataKey="x"
          tickFormatter={formatX}
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
        />
        <YAxis
          tickFormatter={formatY(metric)}
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--bark))",
            border: "1px solid hsl(var(--edge))",
            fontFamily: "JetBrains Mono",
            fontSize: 11,
          }}
          formatter={(v: number) => formatY(metric)(v)}
          labelFormatter={(x: number) => `n = ${x.toLocaleString()}`}
        />
        <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey={optKey}
          stroke={COLOR_OPT}
          strokeWidth={1.8}
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey={baseKey}
          stroke={COLOR_BASE}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface ComparisonCardProps {
  comparison: BenchmarkComparison;
}

const ComparisonCard = ({ comparison }: ComparisonCardProps) => {
  const { summary } = comparison;
  const speedup = (summary.baseline.avgTimeMs / Math.max(0.0001, summary.optimized.avgTimeMs)).toFixed(1);
  const memRatio = (summary.baseline.avgMemMb / Math.max(0.0001, summary.optimized.avgMemMb)).toFixed(1);

  return (
    <article className="bg-bark border border-edge/60 p-4 flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-edge/40 pb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium tracking-tight truncate">
            {comparison.structure}
            <span className="text-muted-foreground font-mono"> vs </span>
            <span className="text-warning">{comparison.baselineName}</span>
          </h3>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
            {comparison.useCase}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="text-right">
            <div className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider">
              speedup
            </div>
            <div className="text-sm font-mono text-primary tabular-nums">{speedup}×</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider">
              mem
            </div>
            <div className="text-sm font-mono text-primary tabular-nums">{memRatio}×</div>
          </div>
        </div>
      </header>

      {/* Time comparison */}
      <section>
        <div className="flex items-baseline justify-between mb-1">
          <h4 className="text-xs font-medium text-foreground/80">Tiempo de ejecución</h4>
          <span className="text-[10px] font-mono text-muted-foreground">ms vs n</span>
        </div>
        <ComparisonChart comparison={comparison} metric="time" />
      </section>

      {/* Memory comparison */}
      <section>
        <div className="flex items-baseline justify-between mb-1">
          <h4 className="text-xs font-medium text-foreground/80">Uso de memoria</h4>
          <span className="text-[10px] font-mono text-muted-foreground">MB vs n</span>
        </div>
        <ComparisonChart comparison={comparison} metric="memory" />
      </section>
    </article>
  );
};

const BenchmarkPage = () => {
  const [comparisons, setComparisons] = useState<BenchmarkComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Bench.Lab — AmazonPe";
    let cancelled = false;
    (async () => {
      try {
        const data = await getBenchmarkComparisons();
        if (!cancelled) setComparisons(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Bench<span className="text-warning">.</span>Lab
        </h2>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {`> compare --optimized=[bloom,bptree,cms,pq,trie] --baseline=naive`}
        </p>
        <div className="mt-3 flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-0.5 bg-primary" />
            <span className="text-muted-foreground">estructura optimizada</span>
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-0.5"
              style={{
                background:
                  "repeating-linear-gradient(90deg, hsl(var(--destructive)) 0 4px, transparent 4px 7px)",
              }}
            />
            <span className="text-muted-foreground">baseline no óptimo</span>
          </span>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-bark border border-edge/60 h-[460px] animate-shimmer"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {comparisons.map((c) => (
            <ComparisonCard key={c.structure} comparison={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BenchmarkPage;
