import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, ShieldAlert, BarChart3, ListOrdered, GitBranch, Home, Activity, Zap, Database, Loader2, Send } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { useOptimized } from "@/lib/optimized-context";
import { getInitStatus, startInitAsync } from "@/lib/api";

const INIT_PRODUCTS = parseInt(import.meta.env.VITE_INIT_PRODUCTS || "1000000");
const INIT_TRANSACTIONS = parseInt(import.meta.env.VITE_INIT_TRANSACTIONS || "10000000");

const NAV = [
  { to: "/", label: "Discover", icon: Home, end: true },
  { to: "/ingest", label: "Ingest.Console", icon: Send, color: "text-neon-magenta" },
  { to: "/fraud", label: "Fraud.Sys", icon: ShieldAlert, color: "text-neon-green" },
  { to: "/benchmark", label: "Bench.Lab", icon: BarChart3, color: "text-warning" },
  { to: "/priority", label: "Queue.Ops", icon: ListOrdered, color: "text-neon-magenta" },
  { to: "/lsm", label: "LSM_Tree.Log", icon: GitBranch, color: "text-neon-blue" },
];

export const AppLayout = () => {
  const [uptime, setUptime] = useState(99.998);
  const [latency, setLatency] = useState(14.2);
  const location = useLocation();
  const { optimized, toggle } = useOptimized();
  const [initStatus, setInitStatus] = useState<{
    running: boolean;
    initialized: boolean;
    products: { done: number; total: number; percent: number };
    transactions: { done: number; total: number; percent: number };
  } | null>(null);
  const [initLoading, setInitLoading] = useState(false);

  // Poll init status only while running or not yet initialized
  useEffect(() => {
    let alive = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        const status = await getInitStatus();
        if (!alive) return;
        setInitStatus(status);

        // Stop polling once initialized and not running
        if (status.initialized && !status.running && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch {
        // ignore
      }
    };

    poll();
    intervalId = setInterval(poll, 1000);

    return () => {
      alive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleInit = async () => {
    setInitLoading(true);
    try {
      await startInitAsync(INIT_PRODUCTS, INIT_TRANSACTIONS);
    } catch (e) {
      console.error(e);
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    handleInit();
    const id = setInterval(() => {
      setLatency(+(10 + Math.random() * 12).toFixed(1));
      setUptime(+(99.95 + Math.random() * 0.049).toFixed(3));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-dvh bg-abyss text-foreground font-sans relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-blue/10 blur-[120px] rounded-full" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[600px] h-[600px] bg-neon-magenta/[0.04] blur-[150px] rounded-full" />

      {/* Header */}
      <header className="relative z-20 border-b border-edge/60 bg-bark/80 backdrop-blur-md">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6 flex-wrap">
          <NavLink to="/" className="flex items-center gap-2 shrink-0" aria-label="AmazonPe home">
            <div className="size-3 bg-neon-magenta animate-pulse-glow rounded-sm text-neon-magenta" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              AmazonPe<span className="text-neon-magenta">::</span>Core
            </h1>
          </NavLink>

          {/* Data generation progress - upper left, after logo */}
          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            {initStatus && initStatus.running && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 border border-neon-blue/40 bg-neon-blue/10 text-neon-blue">
                <Loader2 className="size-3 animate-spin" />
                <span>{initStatus.products.done.toLocaleString()} prod</span>
                <span className="text-neon-magenta">/ {initStatus.transactions.done.toLocaleString()} txn</span>
              </div>
            )}
            {initStatus && initStatus.initialized && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 border border-neon-green/40 bg-neon-green/10 text-neon-green">
                <Database className="size-3" />
                <span>{(initStatus.products.total / 1000000).toFixed(1)}M</span>
                <span className="text-neon-magenta">/ {(initStatus.transactions.total / 1000000).toFixed(1)}M</span>
              </div>
            )}
            {initStatus && !initStatus.initialized && !initStatus.running && (
              <button
                type="button"
                onClick={handleInit}
                disabled={initLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 border border-neon-blue/60 bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors"
                title="Click to generate dataset"
              >
                <Database className="size-3" />
                <span>GEN</span>
              </button>
            )}
            {!initStatus && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 border border-edge bg-bark-light text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                <span>loading...</span>
              </div>
            )}
          </div>

          <div className="order-3 sm:order-2 flex-1 min-w-full sm:min-w-0">
            <SearchBar />
          </div>

          <div className="order-2 sm:order-3 flex items-center gap-3 text-xs font-mono shrink-0">
            <button
              type="button"
              onClick={toggle}
              aria-pressed={optimized}
              title={`Optimized data structures: ${optimized ? "ON" : "OFF"} — appends ?optimized=${optimized} to search, autocomplete, top-products & fraud-check`}
              className={`flex items-center gap-1.5 px-2.5 py-1 border transition-all ${
                optimized
                  ? "border-neon-magenta/60 bg-neon-magenta/10 text-neon-magenta shadow-[0_0_12px_hsl(var(--neon-magenta)/0.35)]"
                  : "border-edge bg-bark-light text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className={`size-3 ${optimized ? "fill-current" : ""} `} />
              <span className="uppercase tracking-wider">OPT</span>
              <span className={`size-1.5 rounded-full ${optimized ? "bg-neon-magenta animate-pulse" : "bg-muted-foreground/40"}`} />
              <span className="hidden sm:inline">{optimized ? "ON" : "OFF"}</span>
            </button>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 border border-edge bg-bark-light text-neon-green">
              <Activity className="size-3" />
              <span>UPTIME {uptime}%</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 border border-edge bg-bark-light text-muted-foreground">
              <span className="size-1.5 rounded-full bg-neon-blue animate-pulse" />
              <span>{latency}ms</span>
            </div>
            <div className="size-8 bg-bark-light border border-edge flex items-center justify-center text-neon-blue text-xs font-mono">
              USR
            </div>
          </div>
        </div>

        {/* Sub-nav */}
        <nav
          className="px-4 sm:px-6 pb-2 flex items-center gap-1 overflow-x-auto scrollbar-thin"
          aria-label="Primary"
        >
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap border transition-all ${
                    isActive
                      ? "border-neon-blue/50 bg-neon-blue/10 text-neon-blue shadow-neon-blue"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-edge"
                  }`
                }
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </header>

      <main key={location.pathname} className="relative z-10 animate-fade-in">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-edge/60 mt-12 px-6 py-6 text-[11px] font-mono text-muted-foreground flex flex-wrap gap-4 justify-between">
        <span>// AmazonPe.Core — Andean.Amazonian commerce backbone</span>
        <span>node: lim-eu-east · build 2026.04.b</span>
      </footer>
    </div>
  );
};
