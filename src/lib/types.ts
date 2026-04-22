export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: "PEN" | "USD";
  rating: number;
  reviews: number;
  image: string;
  category: string;
  origin: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface TopProduct {
  id: string;
  sku: string;
  name: string;
  image: string;
  volume: number;
  sales: number;
  delta: number; // % change
}

export type FraudStatus = "fraud" | "clean" | "suspicious";

export interface FraudTx {
  id: string;
  user: string;
  amount: number;
  currency: string;
  status: FraudStatus;
  pattern: string;
  timestamp: string;
  score: number; // 0..1
}

export interface BenchmarkPoint {
  structure: "Trie" | "B+ Tree" | "Count-Min Sketch" | "Bloom Filter" | "Priority Queue" | "LSM Tree";
  operation: string;
  execMs: number;
  memMb: number;
  throughput: number; // ops/sec
  series: { x: number; latency: number; memory: number }[];
}

// New: comparative benchmark — one optimized structure vs a naive baseline.
// Backend should return one BenchmarkComparison per structure.
export type OptimizedStructure =
  | "Bloom Filter"
  | "B+ Tree"
  | "Count-Min Sketch"
  | "Priority Queue"
  | "Trie";

export interface BenchmarkSamplePoint {
  // x is the workload size (e.g. number of operations / dataset size)
  x: number;
  // execution time in milliseconds at that workload size
  timeMs: number;
  time: number;
  
  // memory footprint in megabytes at that workload size
  memMb: number;
}

export interface BenchmarkSeries {
  // Display label for the series (e.g. "Bloom Filter", "Linear Scan")
  label: string;
  // Whether this series is the optimized structure or the naive baseline
  kind: "optimized" | "baseline";
  // Sample points across workload sizes (shared x across both series of a comparison)
  points: BenchmarkSamplePoint[];
}

export interface BenchmarkComparison {
  // The optimized data structure being benchmarked
  structure: OptimizedStructure;
  // The use case the comparison illustrates (e.g. "Membership test")
  useCase: string;
  // Short human-readable name of the non-optimal counterpart (e.g. "Linear Scan")
  baselineName: string;
  // Two series: [optimized, baseline] — frontend renders both on the same axis
  series: [BenchmarkSeries, BenchmarkSeries];
  // Aggregate summary metrics for headline tiles
  summary: {
    optimized: { avgTimeMs: number; avgMemMb: number };
    baseline: { avgTimeMs: number; avgMemMb: number };
  };
  title: string;
  description: string;
  id: string;
  metric: string;
}

export interface PriorityOrder {
  id: string;
  priority: number; // 1 highest
  customer: string;
  amount: number;
  total: number;
  timestamp: string;
  region: string;
  sla: "P0" | "P1" | "P2" | "P3";
}

export type LsmEventType = "INSERT" | "FLUSH" | "COMPACT" | "MERGE" | "READ";

export interface LsmEvent {
  id: string;
  type: LsmEventType;
  level: number; // 0..N
  timestamp: string;
  bytes: number;
  key?: string;
  detail: string;
}

// Update your imports or add these interfaces
export interface LsmDebugResponse {
  description: string;
  lsm_state: {
    levels: Array<{ level: number; count: number; size_bytes: number }>;
  };
  timeline: LsmEvent[];
}
