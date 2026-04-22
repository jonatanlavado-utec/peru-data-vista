import { useState } from "react";
import { Package, CreditCard, ListOrdered, Send, CheckCircle2, AlertTriangle, Loader2, Copy } from "lucide-react";

type Endpoint = "/api/products" | "/api/transactions" | "/api/orders";

interface ActionDef {
  key: "product" | "transaction" | "order";
  label: string;
  icon: typeof Package;
  endpoint: Endpoint;
  accent: string;
  border: string;
  bg: string;
  describe: string;
  triggers: string[];
  build: () => Record<string, unknown>;
}

const randomId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

const ACTIONS: ActionDef[] = [
  {
    key: "product",
    label: "Agregar producto",
    icon: Package,
    endpoint: "/api/products",
    accent: "text-neon-blue",
    border: "border-neon-blue/40",
    bg: "bg-neon-blue/10",
    describe: "Indexa en B+ Tree, Trie y Count-Min Sketch",
    triggers: ["B+ Tree", "Trie", "CMS"],
    build: () => ({
      id: randomId("prod"),
      sku: `SKU-${Math.floor(10000 + Math.random() * 89999)}`,
      name: "Laptop Gaming",
      price: 2999.99,
      sales: 0,
      image_url: "https://ejemplo.com/imagen.jpg",
      category: "Electronics",
    }),
  },
  {
    key: "transaction",
    label: "Procesar transacción",
    icon: CreditCard,
    endpoint: "/api/transactions",
    accent: "text-neon-green",
    border: "border-neon-green/40",
    bg: "bg-neon-green/10",
    describe: "Evalúa contra Bloom Filter de fraude",
    triggers: ["Bloom Filter"],
    build: () => ({
      id: randomId("txn"),
      user: `user${Math.floor(100 + Math.random() * 900)}`,
      amount: +(50 + Math.random() * 500).toFixed(2),
      currency: "PEN",
      status: "clean",
      pattern: "normal",
      timestamp: new Date().toISOString(),
      score: +Math.random().toFixed(2),
    }),
  },
  {
    key: "order",
    label: "Crear orden",
    icon: ListOrdered,
    endpoint: "/api/orders",
    accent: "text-neon-magenta",
    border: "border-neon-magenta/40",
    bg: "bg-neon-magenta/10",
    describe: "Encola en Priority Queue (1=EXPRESS, 2=STD, 3=SCHED)",
    triggers: ["Priority Queue"],
    build: () => {
      const priority = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
      return {
        id: randomId("order"),
        customer_id: randomId("cust"),
        product_ids: [randomId("prod")],
        priority,
        total: +(100 + Math.random() * 800).toFixed(2),
      };
    },
  },
];

type Status = "idle" | "loading" | "success" | "error";

interface ResultState {
  status: Status;
  payload?: Record<string, unknown>;
  response?: unknown;
  error?: string;
  ts?: string;
}

export default function IngestPage() {
  const [results, setResults] = useState<Record<string, ResultState>>({
    product: { status: "idle" },
    transaction: { status: "idle" },
    order: { status: "idle" },
  });

  const run = async (action: ActionDef) => {
    const payload = action.build();
    setResults((r) => ({ ...r, [action.key]: { status: "loading", payload } }));
    try {
      const res = await fetch(action.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        // keep raw text
      }
      if (!res.ok) {
        throw new Error(
          typeof parsed === "object" && parsed && "error" in parsed
            ? String((parsed as { error: unknown }).error)
            : `HTTP ${res.status}`,
        );
      }
      setResults((r) => ({
        ...r,
        [action.key]: {
          status: "success",
          payload,
          response: parsed,
          ts: new Date().toISOString(),
        },
      }));
    } catch (e) {
      setResults((r) => ({
        ...r,
        [action.key]: {
          status: "error",
          payload,
          error: e instanceof Error ? e.message : "Unknown error",
          ts: new Date().toISOString(),
        },
      }));
    }
  };

  const copy = (val: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(val, null, 2)).catch(() => {});
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-neon-magenta uppercase tracking-widest mb-2">
          <Send className="size-3.5" />
          <span>// Ingest.Console</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ingesta de datos</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-mono">
          Cada acción genera un JSON y lo envía al backend. El servidor dispara las indexaciones
          (B+ Tree, Trie, CMS), evalúa fraude (Bloom) y encola órdenes prioritarias (PQ).
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {ACTIONS.map((a) => {
          const r = results[a.key];
          const Icon = a.icon;
          return (
            <article
              key={a.key}
              className={`relative border ${a.border} ${a.bg} backdrop-blur-sm flex flex-col`}
            >
              <header className="px-4 py-3 border-b border-edge/60 flex items-center gap-2">
                <Icon className={`size-4 ${a.accent}`} />
                <h2 className={`font-mono text-xs uppercase tracking-wider ${a.accent}`}>
                  {a.label}
                </h2>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                  POST {a.endpoint}
                </span>
              </header>

              <div className="px-4 py-3 space-y-3 flex-1">
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  {a.describe}
                </p>
                <div className="flex flex-wrap gap-1">
                  {a.triggers.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-1.5 py-0.5 border border-edge bg-bark-light text-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => run(a)}
                  disabled={r.status === "loading"}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 border ${a.border} ${a.bg} ${a.accent} font-mono text-xs uppercase tracking-wider hover:brightness-125 transition-all disabled:opacity-50`}
                >
                  {r.status === "loading" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  <span>{r.status === "loading" ? "Enviando..." : "Generar y enviar"}</span>
                </button>

                {r.payload && (
                  <details open className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
                      <span>Payload JSON</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          copy(r.payload);
                        }}
                        className="flex items-center gap-1 hover:text-neon-blue"
                      >
                        <Copy className="size-3" />
                        copy
                      </button>
                    </summary>
                    <pre className="mt-2 p-2 bg-abyss/80 border border-edge text-[11px] font-mono text-foreground overflow-auto max-h-48">
                      {JSON.stringify(r.payload, null, 2)}
                    </pre>
                  </details>
                )}

                {r.status === "success" && (
                  <div className="border border-neon-green/40 bg-neon-green/5 p-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-neon-green mb-1">
                      <CheckCircle2 className="size-3" />
                      <span>200 OK · {new Date(r.ts!).toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-[11px] font-mono text-foreground/90 overflow-auto max-h-40">
                      {JSON.stringify(r.response, null, 2)}
                    </pre>
                  </div>
                )}

                {r.status === "error" && (
                  <div className="border border-destructive/50 bg-destructive/10 p-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-destructive mb-1">
                      <AlertTriangle className="size-3" />
                      <span>error · {new Date(r.ts!).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] font-mono text-destructive/90 break-all">
                      {r.error}
                    </p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
