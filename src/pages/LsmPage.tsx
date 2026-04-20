import { useEffect, useState } from "react";
import { getLsmDebug } from "@/lib/api";
import type { LsmEvent } from "@/lib/types";
import { Database, Layers, GitMerge, FileInput, Eye } from "lucide-react";

const TYPE_META: Record<LsmEvent["type"], { color: string; Icon: typeof Database }> = {
  INSERT: { color: "text-neon-green border-neon-green/40 bg-neon-green/10", Icon: FileInput },
  FLUSH: { color: "text-neon-blue border-neon-blue/40 bg-neon-blue/10", Icon: Database },
  COMPACT: { color: "text-warning border-warning/40 bg-warning/10", Icon: Layers },
  MERGE: { color: "text-neon-magenta border-neon-magenta/40 bg-neon-magenta/10", Icon: GitMerge },
  READ: { color: "text-muted-foreground border-edge bg-bark-light", Icon: Eye },
};

const formatBytes = (b: number) => {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / (1024 * 1024)).toFixed(2)}MB`;
};

const LsmPage = () => {
  const [events, setEvents] = useState<LsmEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "LSM_Tree.Log — AmazonPe";
    (async () => {
      const d = await getLsmDebug();
      setEvents(d);
      setLoading(false);
    })();
  }, []);

  const levels = [0, 1, 2, 3, 4];
  const levelLoads = levels.map((l) => {
    const matching = events.filter((e) => e.level === l);
    const bytes = matching.reduce((s, e) => s + e.bytes, 0);
    return { level: l, count: matching.length, bytes };
  });
  const maxBytes = Math.max(1, ...levelLoads.map((l) => l.bytes));

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <section>
        <header className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            LSM_Tree<span className="text-neon-blue">.</span>Log
          </h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {`> tail -f compaction --levels=0..4`}
          </p>
        </header>

        <div className="bg-bark border border-edge/60">
          <div className="p-3 border-b border-edge/60 flex items-center justify-between bg-bark-light/30">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
              [ event_timeline ]
            </span>
            <span className="text-[11px] font-mono text-neon-green flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-neon-green animate-pulse" />
              streaming
            </span>
          </div>

          <ol className="relative">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li key={i} className="p-3 border-b border-edge/30">
                    <div className="h-12 animate-shimmer" />
                  </li>
                ))
              : events.map((e) => {
                  const meta = TYPE_META[e.type];
                  const Icon = meta.Icon;
                  return (
                    <li
                      key={e.id}
                      className="px-4 py-3 border-b border-edge/30 flex items-start gap-3 hover:bg-bark-light/30 group"
                    >
                      <div
                        className={`size-8 shrink-0 border flex items-center justify-center ${meta.color}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${meta.color}`}>
                            {e.type}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            L{e.level}
                          </span>
                          {e.key && (
                            <span className="text-[11px] font-mono text-foreground truncate">
                              {e.key}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                            {new Date(e.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {e.detail} · <span className="text-foreground">{formatBytes(e.bytes)}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
          </ol>
        </div>
      </section>

      {/* Level visualization */}
      <aside>
        <div className="bg-bark border border-edge/60 p-4 sticky top-32">
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
            [ tree_state ]
          </h3>
          <div className="space-y-3">
            {levelLoads.map((l) => {
              const w = (l.bytes / maxBytes) * 100;
              return (
                <div key={l.level}>
                  <div className="flex justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-foreground">L{l.level}</span>
                    <span className="text-muted-foreground">
                      {l.count} ev · {formatBytes(l.bytes)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-bark-light overflow-hidden border border-edge/60">
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${w}%`,
                        backgroundColor:
                          l.level === 0 ? "hsl(var(--success))" : l.level <= 2 ? "hsl(var(--primary))" : "hsl(var(--accent))",
                        boxShadow: `0 0 12px hsl(var(--primary) / 0.4)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-edge/60 text-[10px] font-mono text-muted-foreground space-y-1">
            <p>// L0 holds recent MemTable flushes</p>
            <p>// compaction merges down through levels</p>
            <p>// optimal for write-heavy workloads</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LsmPage;
