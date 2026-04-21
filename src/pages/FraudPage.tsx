import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { getFraudCheck } from "@/lib/api";
import { useOptimized } from "@/lib/optimized-context";
import type { FraudTx } from "@/lib/types";

const STATUS_META: Record<FraudTx["status"], { label: string; cls: string; row: string; Icon: typeof ShieldAlert }> = {
  fraud: {
    label: "FRAUD",
    cls: "bg-destructive/15 text-destructive border-destructive/40",
    row: "bg-destructive/[0.04] hover:bg-destructive/[0.08] border-l-2 border-l-destructive",
    Icon: ShieldAlert,
  },
  suspicious: {
    label: "SUSPICIOUS",
    cls: "bg-warning/15 text-warning border-warning/40",
    row: "bg-warning/[0.03] hover:bg-warning/[0.06] border-l-2 border-l-warning",
    Icon: AlertTriangle,
  },
  clean: {
    label: "CLEAN",
    cls: "bg-neon-green/10 text-neon-green border-neon-green/30",
    row: "hover:bg-bark-light/50 border-l-2 border-l-transparent",
    Icon: ShieldCheck,
  },
};

const FraudPage = () => {
  const [items, setItems] = useState<FraudTx[]>([]);
  const [loading, setLoading] = useState(true);
  const { optimized } = useOptimized();

  // Inside FraudPage component
  useEffect(() => {
    document.title = "Fraud.Sys — AmazonPe";
    let alive = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const data = await getFraudCheck(40); // Requesting 40 items
        if (alive) {
          // Now 'data' is already FraudTx[] thanks to our API helper mapping
          setItems(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (alive) setLoading(false);
      }
    };

    fetchData();
    return () => { alive = false; };
  }, [optimized]);

  const stats = {
    total: items.length,
    fraud: items.filter((t) => t.status === "fraud").length,
    suspicious: items.filter((t) => t.status === "suspicious").length,
    clean: items.filter((t) => t.status === "clean").length,
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Fraud<span className="text-neon-green">.</span>Sys
        </h2>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {`> bloom_filter --check --window=24h`}
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Tx", value: stats.total, color: "text-foreground" },
          { label: "Fraud", value: stats.fraud, color: "text-destructive" },
          { label: "Suspicious", value: stats.suspicious, color: "text-warning" },
          { label: "Clean", value: stats.clean, color: "text-neon-green" },
        ].map((s) => (
          <div key={s.label} className="bg-bark border border-edge/60 p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {s.label}
            </div>
            <div className={`text-2xl font-mono mt-1 tabular-nums ${s.color}`}>
              {loading ? "—" : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-bark border border-edge/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bark-light/50 border-b border-edge/60">
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Tx ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pattern</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-edge/30">
                      <td colSpan={6} className="p-3">
                        <div className="h-4 w-full animate-shimmer" />
                      </td>
                    </tr>
                  ))
                : items.map((t) => {
                    const meta = STATUS_META[t.status];
                    const Icon = meta.Icon;
                    return (
                      <tr
                        key={t.id}
                        className={`border-b border-edge/30 transition-colors ${meta.row}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{t.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.user}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                          S/ {t.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${meta.cls}`}
                          >
                            <Icon className="size-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {t.pattern}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">
                          <span
                            className={
                              t.score > 0.78
                                ? "text-destructive"
                                : t.score > 0.5
                                  ? "text-warning"
                                  : "text-neon-green"
                            }
                          >
                            {(t.score * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FraudPage;
