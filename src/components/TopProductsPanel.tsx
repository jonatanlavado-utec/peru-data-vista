import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getTopProducts } from "@/lib/api";
import type { TopProduct } from "@/lib/types";

export const TopProductsPanel = () => {
  const [items, setItems] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await getTopProducts();
        if (alive) {
          setItems(data);
          setLoading(false);
        }
      } catch {
        if (alive) setLoading(false);
      }
    };
    load();
    const id = setInterval(() => {
      load();
      setTick((t) => t + 1);
    }, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <aside className="bg-bark border border-edge/60 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-magenta to-transparent opacity-60" />
      <div className="p-3 border-b border-edge/60 flex justify-between items-center bg-bark-light/30">
        <h2 className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
          [ Count_Min_Sketch :: TopK ]
        </h2>
        <span className="text-[10px] font-mono text-neon-magenta flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-neon-magenta animate-pulse" />
          REC...
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2.5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="size-11 animate-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 animate-shimmer" />
                  <div className="h-2 w-1/2 animate-shimmer" />
                </div>
              </div>
            ))
          : items.map((p, i) => {
              const up = p.delta >= 0;
              return (
                <div
                  key={`${p.id}-${tick}`}
                  className="flex items-center gap-3 group cursor-pointer animate-fade-in p-1.5 -m-1.5 hover:bg-bark-light/50 transition-colors"
                >
                  <div className="size-11 bg-bark-light border border-edge shrink-0 overflow-hidden relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-0 left-0 size-4 bg-bark border-r border-b border-edge flex items-center justify-center text-[9px] font-mono text-neon-blue">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate text-foreground group-hover:text-neon-blue transition-colors">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      vol: {p?.sales?.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={`text-right font-mono text-xs flex items-center gap-1 ${
                      up ? "text-neon-green" : "text-destructive"
                    }`}
                  >
                    {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    <span>
                      {up ? "+" : ""}
                      {p.delta}%
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </aside>
  );
};
