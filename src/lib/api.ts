// AmazonPe mock API layer
// All endpoints simulate network latency. Replace `mockFetch` calls with real `fetch`
// when backend is ready. Each function maps 1:1 to a documented endpoint.

import {
  PRODUCTS,
  TOP_PRODUCTS,
  FRAUD_TX,
  BENCHMARK,
  PRIORITY_ORDERS,
  LSM_LOG,
  AUTOCOMPLETE_TERMS,
} from "./data";
import { getOptimizedFlag } from "./optimized-context";
import type {
  Product,
  TopProduct,
  FraudTx,
  BenchmarkPoint,
  PriorityOrder,
  LsmEvent,
} from "./types";

// Toggle to switch to real backend later.
export const USE_MOCKS = true;
const BASE_URL = "/api";

function delay<T>(value: T, min = 250, max = 700): Promise<T> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function mockFetch<T>(path: string, factory: () => T): Promise<T> {
  if (!USE_MOCKS) {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
    return (await res.json()) as T;
  }
  // tiny chance of error for realism
  if (Math.random() < 0.005) {
    return delay(null as unknown as T, 200, 400).then(() => {
      throw new Error(`Network error on ${path}`);
    });
  }
  return delay(factory());
}

// GET /api/products?page=1
export function getProducts(page = 1, pageSize = 12) {
  return mockFetch(`/products?page=${page}`, () => {
    const start = (page - 1) * pageSize;
    const items = PRODUCTS.slice(start, start + pageSize);
    return {
      items,
      page,
      pageSize,
      total: PRODUCTS.length,
      hasMore: start + pageSize < PRODUCTS.length,
    } as { items: Product[]; page: number; pageSize: number; total: number; hasMore: boolean };
  });
}

// GET /api/search?q=&optimized=
export function searchProducts(q: string) {
  const optimized = getOptimizedFlag();
  return mockFetch(`/search?q=${encodeURIComponent(q)}&optimized=${optimized}`, () => {
    const term = q.trim().toLowerCase();
    if (!term) return { items: [] as Product[], q, optimized };
    const items = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
    return { items, q, optimized };
  });
}

// GET /api/autocomplete?q=&optimized=
export function autocomplete(q: string) {
  const optimized = getOptimizedFlag();
  return mockFetch(`/autocomplete?q=${encodeURIComponent(q)}&optimized=${optimized}`, () => {
    const term = q.trim().toLowerCase();
    if (!term) return { suggestions: [] as string[] };
    const suggestions = AUTOCOMPLETE_TERMS.filter((s) => s.toLowerCase().includes(term)).slice(0, 8);
    return { suggestions };
  }) as Promise<{ suggestions: string[] }>;
}

// GET /api/top-products?optimized=
export function getTopProducts() {
  const optimized = getOptimizedFlag();
  return mockFetch(`/top-products?optimized=${optimized}`, () => {
    // Simulate live mutation in volumes
    return TOP_PRODUCTS.map((t) => ({
      ...t,
      volume: Math.max(50, t.volume + Math.round((Math.random() - 0.5) * 200)),
      delta: +(t.delta + (Math.random() - 0.5) * 2).toFixed(1),
    })) as TopProduct[];
  });
}

// GET /api/fraud-check?optimized=
export function getFraudCheck() {
  const optimized = getOptimizedFlag();
  return mockFetch(`/fraud-check?optimized=${optimized}`, () => FRAUD_TX as FraudTx[]);
}

// GET /api/benchmark
export function getBenchmark() {
  return mockFetch(`/benchmark`, () => BENCHMARK as BenchmarkPoint[]);
}

// GET /api/priority-orders?page=&limit=
export function getPriorityOrders(page = 1, limit = 20) {
  return mockFetch(`/priority-orders?page=${page}&limit=${limit}`, () => {
    const start = (page - 1) * limit;
    const items = PRIORITY_ORDERS.slice(start, start + limit);
    return {
      items,
      page,
      limit,
      total: PRIORITY_ORDERS.length,
      hasMore: start + limit < PRIORITY_ORDERS.length,
    } as { items: PriorityOrder[]; page: number; limit: number; total: number; hasMore: boolean };
  });
}

// GET /api/lsm-debug
export function getLsmDebug() {
  return mockFetch(`/lsm-debug`, () => LSM_LOG as LsmEvent[]);
}
