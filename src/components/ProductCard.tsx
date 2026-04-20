import { Star } from "lucide-react";
import type { Product } from "@/lib/types";

const STATUS_BADGE: Record<Product["status"], { label: string; cls: string }> = {
  in_stock: { label: "IN STOCK", cls: "bg-neon-green/15 text-neon-green border-neon-green/30" },
  low_stock: { label: "LOW STOCK", cls: "bg-warning/15 text-warning border-warning/30" },
  out_of_stock: { label: "OUT", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

export const ProductCard = ({ product }: { product: Product }) => {
  const badge = STATUS_BADGE[product.status];

  return (
    <article className="group bg-bark border border-edge/60 hover:border-neon-blue/50 flex flex-col transition-all duration-300 relative overflow-hidden">
      <div className="absolute -inset-px bg-gradient-to-b from-neon-blue/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="p-2.5 border-b border-edge/60 flex justify-between items-center bg-bark-light/50 relative z-10">
        <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
          SKU:{product.sku}
        </span>
        <span className={`text-[9px] font-mono px-1.5 py-0.5 border ${badge.cls}`}>{badge.label}</span>
      </div>

      <div className="aspect-square bg-bark-light relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover mix-blend-luminosity opacity-60 group-hover:mix-blend-normal group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-bark/80 backdrop-blur text-[9px] font-mono text-muted-foreground border border-edge/60">
          ORG: {product.origin}
        </div>
      </div>

      <div className="p-3.5 flex flex-col flex-1 relative z-10">
        <h3 className="text-sm font-medium text-foreground mb-1 text-balance leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-3 text-[11px]">
          <Star className="size-3 fill-warning text-warning" />
          <span className="font-mono text-foreground">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-end justify-between mt-auto">
          <div>
            <span className="block text-[10px] font-mono text-muted-foreground mb-0.5">
              {product.currency}
            </span>
            <span className="text-lg font-mono text-neon-blue tabular-nums">
              {product.price.toFixed(2)}
            </span>
          </div>
          <button className="px-3 py-1.5 bg-bark-light hover:bg-neon-blue hover:text-primary-foreground transition-colors text-[11px] font-mono uppercase tracking-wider border border-edge group-hover:border-neon-blue/50">
            Fetch
          </button>
        </div>
      </div>
    </article>
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-bark border border-edge/60 flex flex-col">
    <div className="h-9 border-b border-edge/60 bg-bark-light/50" />
    <div className="aspect-square animate-shimmer" />
    <div className="p-3.5 space-y-2">
      <div className="h-4 w-3/4 animate-shimmer" />
      <div className="h-3 w-1/3 animate-shimmer" />
      <div className="h-7 w-full animate-shimmer mt-3" />
    </div>
  </div>
);
