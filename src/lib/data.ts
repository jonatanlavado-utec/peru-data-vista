import type { Product, TopProduct, FraudTx, BenchmarkPoint, PriorityOrder, LsmEvent } from "./types";

const productImg = (seed: number) => `https://picsum.photos/seed/amzpe-${seed}/600/600`;

const NAMES = [
  ["Cacao Pod Matrix", "Botanicals", "Madre de Dios"],
  ["Ayahuasca Vine Segment", "Botanicals", "Loreto"],
  ["Bioluminescent Orchid Spores", "Botanicals", "Loreto"],
  ["Shiringa Latex Data Core", "Materials", "Madre de Dios"],
  ["Macaw Clay Lick Soil", "Minerals", "Tambopata"],
  ["Wild Cacao Nibs", "Botanicals", "San Martín"],
  ["Arapaima Leather Offcuts", "Materials", "Loreto"],
  ["Uña de Gato Bark Powder", "Botanicals", "Loreto"],
  ["Copal Resin Extract", "Botanicals", "Madre de Dios"],
  ["Maca Root Synth-Extract", "Botanicals", "Junín"],
  ["Camu-Camu Concentrate", "Botanicals", "Ucayali"],
  ["Sangre de Grado Resin", "Botanicals", "Loreto"],
  ["Tagua Nut Polished", "Materials", "San Martín"],
  ["Brazil Nut Cold-Press Oil", "Botanicals", "Madre de Dios"],
  ["Aguaje Pulp Cubes", "Botanicals", "Loreto"],
  ["Sacha Inchi Oil 500ml", "Botanicals", "San Martín"],
  ["Chuchuhuasi Bark Tincture", "Botanicals", "Pucallpa"],
  ["Andean Quinoa Flake", "Botanicals", "Puno"],
  ["Amazonian Honey 1kg", "Botanicals", "Madre de Dios"],
  ["Chambira Fiber Bundle", "Materials", "Loreto"],
  ["Pucara Bull Ceramic", "Crafts", "Puno"],
  ["Vicuña Blend Poncho", "Textiles", "Cusco"],
  ["Alpaca Yarn Skein", "Textiles", "Arequipa"],
  ["Silver Chakana Pin", "Crafts", "Cusco"],
];

export const PRODUCTS: Product[] = NAMES.map(([name, category, origin], i) => ({
  id: `p_${1000 + i}`,
  sku: `${category.slice(0, 3).toUpperCase()}-${(881 + i * 17).toString().padStart(4, "0")}`,
  name,
  price: +(20 + Math.random() * 480).toFixed(2),
  currency: "PEN",
  rating: +(3.6 + Math.random() * 1.4).toFixed(1),
  reviews: Math.floor(Math.random() * 1200) + 12,
  image: productImg(i + 1),
  category,
  origin,
  status: ((): Product["status"] => {
    const r = Math.random();
    if (r < 0.7) return "in_stock";
    if (r < 0.92) return "low_stock";
    return "out_of_stock";
  })(),
}));

export const AUTOCOMPLETE_TERMS = Array.from(
  new Set([
    ...PRODUCTS.map((p) => p.name),
    "cacao",
    "alpaca",
    "vicuña",
    "ayahuasca",
    "amazon honey",
    "brazil nut",
    "ceramic",
    "textile",
    "loreto",
    "cusco",
    "maca",
  ]),
);

export const TOP_PRODUCTS: TopProduct[] = PRODUCTS.slice(0, 6).map((p, i) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  image: p.image,
  volume: 8421 - i * 1100 + Math.floor(Math.random() * 400),
  delta: +(14.2 - i * 2.3).toFixed(1),
}));

const PATTERNS = [
  "velocity_spike",
  "geo_mismatch",
  "card_testing",
  "high_value_first_purchase",
  "bloom_collision",
  "device_fingerprint_mismatch",
  "burst_purchase",
];

export const FRAUD_TX: FraudTx[] = Array.from({ length: 18 }).map((_, i) => {
  const score = Math.random();
  const status: FraudTx["status"] = score > 0.78 ? "fraud" : score > 0.5 ? "suspicious" : "clean";
  return {
    id: `tx_${(0x8f2a + i * 91).toString(16)}`,
    user: ["lucia.q", "carlos.m", "renata.v", "diego.h", "ana.p", "jorge.r"][i % 6] + "@amzpe.io",
    amount: +(20 + Math.random() * 1980).toFixed(2),
    currency: "PEN",
    status,
    pattern: status === "clean" ? "—" : PATTERNS[i % PATTERNS.length],
    timestamp: new Date(Date.now() - i * 1000 * 60 * 7).toISOString(),
    score: +score.toFixed(2),
  };
});

const STRUCTS: BenchmarkPoint["structure"][] = [
  "Trie",
  "B+ Tree",
  "Count-Min Sketch",
  "Bloom Filter",
  "Priority Queue",
  "LSM Tree",
];

export const BENCHMARK: BenchmarkPoint[] = STRUCTS.map((structure, i) => {
  const baseLat = [0.4, 0.9, 0.2, 0.15, 0.7, 1.4][i];
  const baseMem = [42, 128, 18, 9, 64, 256][i];
  return {
    structure,
    operation: ["search", "search", "topK", "membership", "pop", "insert"][i],
    execMs: +(baseLat + Math.random() * 0.3).toFixed(2),
    memMb: +(baseMem + Math.random() * 8).toFixed(1),
    throughput: Math.floor(50000 / baseLat + Math.random() * 5000),
    series: Array.from({ length: 12 }).map((_, x) => ({
      x,
      latency: +(baseLat + Math.sin(x / 2) * 0.2 + Math.random() * 0.15).toFixed(2),
      memory: +(baseMem + Math.cos(x / 3) * 6 + Math.random() * 4).toFixed(1),
    })),
  };
});

const REGIONS = ["Lima", "Cusco", "Arequipa", "Loreto", "Trujillo", "Piura", "Tacna"];
const SLAS: PriorityOrder["sla"][] = ["P0", "P1", "P2", "P3"];

export const PRIORITY_ORDERS: PriorityOrder[] = Array.from({ length: 80 })
  .map((_, i) => ({
    id: `ord_${(0x77cf + i * 17).toString(16).toUpperCase()}`,
    priority: Math.floor(Math.random() * 100) + 1,
    customer: ["Lucía Q.", "Carlos M.", "Renata V.", "Diego H.", "Ana P.", "Jorge R.", "Sofía B."][i % 7],
    amount: +(50 + Math.random() * 4500).toFixed(2),
    timestamp: new Date(Date.now() - i * 1000 * 60 * 3.4).toISOString(),
    region: REGIONS[i % REGIONS.length],
    sla: SLAS[Math.min(3, Math.floor(Math.random() * 4))],
  }))
  .sort((a, b) => a.priority - b.priority);

const LSM_DETAILS = [
  "MemTable buffer 84% full — flush imminent",
  "L0 → L1 compaction merging 4 SSTables",
  "Tombstone purge complete on level 2",
  "Bloom filter rebuilt for SSTable_4421",
  "Read amplification 2.3x within budget",
  "Major compaction finished, freed 1.2GB",
];

export const LSM_LOG: LsmEvent[] = Array.from({ length: 24 }).map((_, i) => {
  const types: LsmEvent["type"][] = ["INSERT", "INSERT", "INSERT", "FLUSH", "COMPACT", "MERGE", "READ"];
  const type = types[i % types.length];
  return {
    id: `lsm_${i}`,
    type,
    level: type === "INSERT" || type === "FLUSH" ? 0 : Math.min(4, Math.floor(i / 6)),
    timestamp: new Date(Date.now() - i * 1000 * 12).toISOString(),
    bytes: 1024 * (1 + Math.floor(Math.random() * 4096)),
    key: type === "INSERT" || type === "READ" ? `sku:${(881 + i * 17).toString().padStart(4, "0")}` : undefined,
    detail: LSM_DETAILS[i % LSM_DETAILS.length],
  };
});
