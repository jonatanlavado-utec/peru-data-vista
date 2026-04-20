import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { autocomplete } from "@/lib/api";

export const SearchBar = () => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced autocomplete
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const { suggestions } = await autocomplete(term);
        setSuggestions(suggestions);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(id);
  }, [q]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = (term: string) => {
    if (!term.trim()) return;
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="flex items-center bg-bark-light border border-edge focus-within:border-neon-blue/60 focus-within:shadow-neon-blue transition-all">
        <span className="pl-3 text-neon-blue font-mono select-none">{">"}</span>
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(suggestions.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Enter") {
              submit(active >= 0 ? suggestions[active] : q);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Query inventory — try 'cacao' or 'alpaca'"
          aria-label="Search products"
          autoComplete="off"
          className="w-full bg-transparent border-none outline-none text-foreground font-mono text-sm py-2.5 px-2 placeholder:text-muted-foreground/60"
        />
        <div className="pr-3 flex items-center gap-2 text-muted-foreground">
          {loading ? (
            <Loader2 className="size-3.5 animate-spin text-neon-blue" />
          ) : (
            <Search className="size-3.5" />
          )}
          <kbd className="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 border border-edge bg-bark">↵</kbd>
        </div>
      </div>

      {open && (suggestions.length > 0 || (q && !loading)) && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-bark border border-edge shadow-2xl animate-fade-in max-h-80 overflow-y-auto"
          role="listbox"
        >
          {suggestions.length === 0 && q && !loading ? (
            <div className="px-3 py-3 text-xs font-mono text-muted-foreground">
              No matches for <span className="text-foreground">"{q}"</span>
            </div>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={s + i}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => submit(s)}
                className={`w-full text-left px-3 py-2 text-sm font-mono flex items-center gap-2 border-l-2 transition-colors ${
                  i === active
                    ? "border-neon-blue bg-neon-blue/5 text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Search className="size-3 text-neon-blue/60" />
                <span>{s}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
