import { useEffect, useState } from "react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { TopProductsPanel } from "@/components/TopProductsPanel";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "AmazonPe::Core — Andean.Amazonian commerce";
    let alive = true;
    (async () => {
      try {
        const data = await getProducts(1);
        if (!alive) return;
        setProducts(data.items);
        setHasMore(data.hasMore);
      } catch (e) {
        if (alive) setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await getProducts(next);
      setProducts((prev) => [...prev, ...data.items]);
      setPage(next);
      setHasMore(data.hasMore);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Discover<span className="text-neon-blue">.</span>
            </h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {`> indexed_catalog --status=active --node=lim-eu-east`}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <span className="px-2 py-1 border border-edge bg-bark-light">{products.length} loaded</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-destructive/40 bg-destructive/10 text-destructive text-sm font-mono">
            ERR: {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {!loading && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-5 py-2.5 bg-bark border border-edge hover:border-neon-blue/60 hover:bg-neon-blue/5 hover:text-neon-blue text-sm font-mono uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loadingMore && <Loader2 className="size-3.5 animate-spin" />}
              {loadingMore ? "fetching..." : "load_more()"}
            </button>
          </div>
        )}

        {!loading && !hasMore && products.length > 0 && (
          <div className="text-center mt-8 text-[11px] font-mono text-muted-foreground">
            // end of catalog · {products.length} items
          </div>
        )}
      </section>

      <TopProductsPanel />
    </div>
  );
};

export default Index;
