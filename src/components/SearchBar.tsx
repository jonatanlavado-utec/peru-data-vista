import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { getAutocomplete } from "@/lib/api";

// 1. Define the shape of our new autocomplete data
interface AutocompleteItem {
  id: string;
  name: string;
  sales: number;
}

export const SearchBar = () => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // 2. Update state to hold the objects instead of plain strings
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  console.log('suggestions', suggestions);

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
        // 3. The API now returns the array directly, no need to destructure { suggestions }
        const results = await getAutocomplete(term);
        setSuggestions(results || []);
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

  const submit = (suggestion: AutocompleteItem) => {
    setQ(suggestion.name);
    setOpen(false);
    // Optional: navigate directly to the product using suggestion.id
    // navigate(`/product/${suggestion.id}`);
    navigate(`/?q=${encodeURIComponent(suggestion.name)}`);
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl z-50">
      <div className="relative group">
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
              setActive((p) => (p < suggestions.length - 1 ? p + 1 : p));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((p) => (p > 0 ? p - 1 : -1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (active >= 0 && suggestions[active]) {
                submit(suggestions[active]);
              } else if (q.trim()) {
                // Submit raw query if nothing is selected
                setOpen(false);
                navigate(`/?q=${encodeURIComponent(q.trim())}`);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Search millions of products..."
          className="w-full h-10 pl-10 pr-12 bg-bark border border-edge rounded-none text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-neon-blue transition-colors">
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center gap-2">
          {loading ? null : <kbd className="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 border border-edge bg-bark">↵</kbd>}
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
                key={s.id || `term-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => submit(s)}
                className={`w-full text-left px-3 py-2 text-sm font-mono flex items-center justify-between gap-2 border-l-2 transition-colors ${
                  i === active
                    ? "border-neon-blue bg-neon-blue/5 text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Search className="size-3 text-neon-blue/60 shrink-0" />
                  <span className="truncate">{s.name}</span>
                </div>
                {/* Optional: Show sales/popularity as a nice badge since the backend returns it now */}
                {s.sales > 0 && (
                  <span className="text-[10px] text-muted-foreground shrink-0 bg-bark-light px-1.5 py-0.5 rounded">
                    {s.sales.toLocaleString()} sold
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};