import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, ShieldAlert, BarChart3, ListOrdered, GitBranch, Home, Activity } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

const NAV = [
  { to: "/", label: "Discover", icon: Home, end: true },
  { to: "/fraud", label: "Fraud.Sys", icon: ShieldAlert, color: "text-neon-green" },
  { to: "/benchmark", label: "Bench.Lab", icon: BarChart3, color: "text-warning" },
  { to: "/priority", label: "Queue.Ops", icon: ListOrdered, color: "text-neon-magenta" },
  { to: "/lsm", label: "LSM_Tree.Log", icon: GitBranch, color: "text-neon-blue" },
];

export const AppLayout = () => {
  const [uptime, setUptime] = useState(99.998);
  const [latency, setLatency] = useState(14.2);
  const location = useLocation();

  useEffect(() => {
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

          <div className="order-3 sm:order-2 flex-1 min-w-full sm:min-w-0">
            <SearchBar />
          </div>

          <div className="order-2 sm:order-3 flex items-center gap-3 text-xs font-mono shrink-0">
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
