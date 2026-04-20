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

export interface PriorityOrder {
  id: string;
  priority: number; // 1 highest
  customer: string;
  amount: number;
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
