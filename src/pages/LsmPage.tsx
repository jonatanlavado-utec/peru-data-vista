import { useEffect, useState } from "react";
import { getLsmDebug } from "@/lib/api";
import type { LsmEvent, LsmDebugResponse } from "@/lib/types";
import { Database, Layers, GitMerge, FileInput, Eye, Loader2 } from "lucide-react";

// Map event types to specific icons and colors
const TYPE_META: Record<LsmEvent["type"], { color: string; Icon: typeof Database }> = {
  INSERT: { color: "text-neon-green border-neon-green/40 bg-neon-green/10", Icon: FileInput },
  FLUSH: { color: "text-neon-blue border-neon-blue/40 bg-neon-blue/10", Icon: Database },
  COMPACT: { color: "text-warning border-warning/40 bg-warning/10", Icon: Layers },
  MERGE: { color: "text-neon-magenta border-neon-magenta/40 bg-neon-magenta/10", Icon: GitMerge },
  READ: { color: "text-muted-foreground border-edge bg-bark-light", Icon: Eye },
};

// Formatter for file sizes
const formatBytes = (b: number) => {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / (1024 * 1024)).toFixed(2)}MB`;
};

const LsmPage = () => {
  const [timeline, setTimeline] = useState<LsmEvent[]>([]);
  const [treeState, setTreeState] = useState<LsmDebugResponse['lsm_state'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLsmDebug();
        setTimeline(data.timeline);
        setTreeState(data.lsm_state);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    load();
    // Refresh every 5 seconds to track simulation progress
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  // Use the server-provided state for the sidebar levels
  const levelLoads = treeState?.levels || [];
  
  // Calculate max bytes for the progress bar relative width. 
  // Fallback to 1024 to avoid division by zero.
  const maxBytes = Math.max(...levelLoads.map(l => l.size_bytes), 1024);

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 p-6 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Main Timeline Section */}
      <div className="flex-1 min-w-0">
        <header className="mb-8">
          <h2 className="text-3xl font-light tracking-tight text-foreground">
            LSM<span className="text-primary">.</span>Tree
          </h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {`> tail -f /var/log/lsm_engine.log`}
          </p>
        </header>
        
        {loading && timeline.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="font-mono text-sm">Loading LSM state...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {timeline.map((e) => {
              // Ensure we don't crash if an unknown event type comes in
              const meta = TYPE_META[e.type] || TYPE_META.READ; 
              const Icon = meta.Icon;
              
              return (
                <div key={e.id} className="p-4 border border-edge/40 bg-bark-dark/50 rounded-lg flex items-start gap-4 hover:border-edge/80 transition-colors">
                  {/* Event Icon */}
                  <div className={`p-2 rounded border ${meta.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  {/* Event Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold tracking-wider ${meta.color.split(' ')[0]}`}>
                        {e.type}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {new Date(e.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-2 break-words">
                      {e.detail}
                    </p>
                    
                    {/* Event Metadata Footer */}
                    <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground flex-wrap">
                      <span className="bg-bark-light px-1.5 py-0.5 rounded">Level {e.level}</span>
                      <span>·</span>
                      <span>{formatBytes(e.bytes)}</span>
                      {e.key && (
                        <>
                          <span>·</span>
                          <span className="text-primary truncate max-w-[200px]" title={e.key}>
                            key: {e.key}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar Section */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="sticky top-6 p-5 border border-edge bg-bark-dark/80 rounded-xl">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Tree Architecture
          </h3>
          
          <div className="space-y-6">
            {levelLoads.length === 0 && !loading && (
              <div className="text-xs text-muted-foreground font-mono text-center py-4">
                No active SSTables.
              </div>
            )}
            
            {levelLoads.map((l) => {
              const w = (l.size_bytes / maxBytes) * 100;
              return (
                <div key={l.level}>
                  {/* Level Header */}
                  <div className="flex justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-foreground">L{l.level}</span>
                    <span className="text-muted-foreground">
                      {l.count} files · {formatBytes(l.size_bytes)}
                    </span>
                  </div>
                  
                  {/* Level Progress Bar */}
                  <div className="h-2 w-full bg-bark-light overflow-hidden border border-edge/60 rounded-full">
                    <div
                      className="h-full transition-all duration-700 rounded-full"
                      style={{
                        width: `${Math.max(w, 2)}%`, // At least 2% width if there is data so it's visible
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
          
          {/* Footer Info */}
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