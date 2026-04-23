import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts } from "@/lib/api";
import { useOptimized } from "@/lib/optimized-context";
import type { Product } from "@/lib/types";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Search as SearchIcon } from "lucide-react";

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const { optimized } = useOptimized();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {console.log("SearchPage q =", q);
    document.title = `"${q}" — AmazonPe search`;
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const data = await searchProducts(q);
        if (alive) {
          setItems(data.items);
          setLoading(false);
        }
      } catch {
        if (alive) {
          setItems([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [q, optimized]);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto">
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <SearchIcon className="size-5 text-neon-blue" />
        <h2 className="text-xl font-bold tracking-tight">
          Trie<span className="text-neon-blue">::</span>lookup
        </h2>
        <span className="font-mono text-sm text-muted-foreground">
          q = <span className="text-foreground">"{q}"</span>
        </span>
        {!loading && (
          <span className="ml-auto text-xs font-mono text-muted-foreground">
            {items.length} match{items.length === 1 ? "" : "es"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="border border-edge bg-bark p-12 text-center">
          <p className="text-muted-foreground font-mono text-sm">
            // no products found for <span className="text-foreground">"{q}"</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
