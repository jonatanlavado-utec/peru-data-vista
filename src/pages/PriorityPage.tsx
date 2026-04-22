import { useEffect, useRef, useState } from "react";
import { getPriorityOrders } from "@/lib/api";
import type { PriorityOrder } from "@/lib/types";
import { Loader2, Zap } from "lucide-react";

const SLA_CLS: Record<PriorityOrder["sla"], string> = {
  P0: "bg-destructive/15 text-destructive border-destructive/40",
  P1: "bg-warning/15 text-warning border-warning/40",
  P2: "bg-neon-blue/15 text-neon-blue border-neon-blue/40",
  P3: "bg-bark-light text-muted-foreground border-edge",
};

const PriorityPage = () => {
  const [items, setItems] = useState<PriorityOrder[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Queue.Ops — AmazonPe";
    (async () => {
      const d = await getPriorityOrders(1, 20);
      setItems(d.items);
      setHasMore(d.hasMore);
      setLoading(false);
    })();
  }, []);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (loading || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || loadingMore) return;
        setLoadingMore(true);
        const next = page + 1;
        const d = await getPriorityOrders(next, 20);
        setItems((prev) => [...prev, ...d.items]);
        setPage(next);
        setHasMore(d.hasMore);
        setLoadingMore(false);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore, loadingMore, page]);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Queue<span className="text-neon-magenta">.</span>Ops
        </h2>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {`> priority_queue --pop --limit=20 (paginated)`}
        </p>
      </header>

      <div className="bg-bark border border-edge/60">
        <div className="p-3 border-b border-edge/60 flex justify-between items-center bg-bark-light/30">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
            [ heap_state ]
          </span>
          <span className="text-[11px] font-mono text-neon-magenta">
            {items.length} popped · page {page}
          </span>
        </div>

        <ul className="divide-y divide-edge/30">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="p-3">
                  <div className="h-10 w-full animate-shimmer" />
                </li>
              ))
            : items.map((o, i) => {
                const intensity = Math.max(0, 1 - o.priority / 100);
                return (
                  <li
                    key={o.id}
                    className="px-4 py-3 flex items-center gap-3 sm:gap-4 hover:bg-bark-light/40 transition-colors animate-slide-in"
                  >
                    <div className="flex flex-col items-center justify-center size-10 sm:size-12 shrink-0 border border-edge bg-bark-light relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-neon-magenta"
                        style={{ opacity: intensity * 0.25 }}
                      />
                      <span className="relative font-mono text-xs text-neon-magenta">
                        #{o.priority}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-foreground truncate">{o.id}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 border ${SLA_CLS[o.sla]}`}
                        >
                          {o.sla}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                        {o.customer} · {o.region} · {new Date(o.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right font-mono text-sm tabular-nums shrink-0">
                      <div className="text-foreground">S/ {o.total.toFixed(2)}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                        <Zap className="size-2.5" />
                        idx:{i + 1}
                      </div>
                    </div>
                  </li>
                );
              })}
        </ul>

        <div ref={sentinelRef} className="p-4 text-center text-[11px] font-mono text-muted-foreground">
          {hasMore ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" /> loading more...
            </span>
          ) : !loading ? (
            "// queue exhausted"
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PriorityPage;
