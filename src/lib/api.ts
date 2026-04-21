// AmazonPe mock API layer
// All endpoints simulate network latency. Replace `mockFetch` calls with real `fetch`
// when backend is ready. Each function maps 1:1 to a documented endpoint.

import {
  PRODUCTS,
  TOP_PRODUCTS,
  FRAUD_TX,
  BENCHMARK,
  BENCHMARK_COMPARISONS,
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
  BenchmarkComparison,
  PriorityOrder,
  LsmEvent,
} from "./types";

// Toggle to switch to real backend later.
export const USE_MOCKS = false;
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
// export function getProducts(page = 1, pageSize = 12) {
//   return mockFetch(`/products?page=${page}`, () => {
//     const start = (page - 1) * pageSize;
//     const items = PRODUCTS.slice(start, start + pageSize);
//     return {
//       items,
//       page,
//       pageSize,
//       total: PRODUCTS.length,
//       hasMore: start + pageSize < PRODUCTS.length,
//     } as { items: Product[]; page: number; pageSize: number; total: number; hasMore: boolean };
//   });
// }

export async function getProducts(page = 1, pageSize = 12) {
  const response = await fetch(`/api/products?page=${page}&page_size=${pageSize}`);
  
  if (!response.ok) {
    throw new Error('Error al cargar productos');
  }

  return await response.json() as { 
    items: Product[]; 
    page: number; 
    pageSize: number; 
    total: number; 
    hasMore: boolean 
  };
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
// export function getTopProducts() {
//   const optimized = getOptimizedFlag();
//   return mockFetch(`/top-products?optimized=${optimized}`, () => {
//     // Simulate live mutation in volumes
//     return TOP_PRODUCTS.map((t) => ({
//       ...t,
//       volume: Math.max(50, t.volume + Math.round((Math.random() - 0.5) * 200)),
//       delta: +(t.delta + (Math.random() - 0.5) * 2).toFixed(1),
//     })) as TopProduct[];
//   });
// }

// Assuming TopProduct is defined elsewhere in your types
export async function getTopProducts(k: number = 10): Promise<TopProduct[]> {
  const optimized = getOptimizedFlag();
  
  try {
    // 1. Construct the URL with both 'k' and 'optimized' query parameters
    const response = await fetch(`/api/top-products?k=${k}&optimized=${optimized}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    // 2. Parse the JSON body
    // The Python response is: { k, optimized, count, results: [...] }
    const data = await response.json();

    // 3. Return the results array to match your previous signature
    return data.results as TopProduct[];
    
  } catch (error) {
    console.error("Failed to fetch top products:", error);
    return []; // Return empty array or handle error as per your UI needs
  }
}


// GET /api/fraud-check?optimized=
//// export function getFraudCheck() {
////   const optimized = getOptimizedFlag();
////   return mockFetch(`/fraud-check?optimized=${optimized}`, () => FRAUD_TX as FraudTx[]);
//// }
export interface FraudResponse {
  optimized: boolean;
  total_checked: number;
  fraudulent_count: number;
  stats: any;
  results: Record<string, boolean>; // El backend devuelve un diccionario { "id": true/false }
}

export async function getFraudCheck(n: number = 60): Promise<FraudTx[]> {
  const optimized = getOptimizedFlag();
  
  try {
    const response = await fetch(`/api/fraud-check?n=${n}&optimized=${optimized}`);
    
    if (!response.ok) throw new Error("Failed to fetch fraud data");

    const data = await response.json();
    
    // Map the results dictionary { "id": boolean } into FraudTx objects
    return Object.entries(data.results).map(([id, isFraudHit]) => {
      // Logic to determine status and score based on backend "hit"
      const score = isFraudHit ? 0.8 + Math.random() * 0.2 : Math.random() * 0.4;
      let status: 'fraud' | 'suspicious' | 'clean' = "clean";
      
      if (isFraudHit) status = "fraud";
      else if (score > 0.25) status = "suspicious"; // Add variety for UI

      return {
        id,
        user: `User-${id.split('_')[1].slice(0, 4)}`, // Extracting partial ID for username
        amount: Math.floor(Math.random() * 5000) + 10,
        currency: "PEN",
        status,
        pattern: isFraudHit ? "Blacklisted Transaction" : "Standard Sequence",
        timestamp: new Date().toISOString(),
        score,
      };
    });
  } catch (error) {
    console.error("Fraud API Error:", error);
    return [];
  }
}


// GET /api/benchmark
export function getBenchmark() {
  return mockFetch(`/benchmark`, () => BENCHMARK as BenchmarkPoint[]);
}

// GET /api/benchmark-comparisons
// Returns one comparison (optimized vs naive baseline) per data structure.
// NOTE: forced to use local mock data until the backend implements this endpoint.
// To switch to the real API, replace the body with:
//   const res = await fetch(`${BASE_URL}/benchmark-comparisons`);
//   return res.json() as Promise<BenchmarkComparison[]>;
export async function getBenchmarkComparisons(): Promise<BenchmarkComparison[]> {
  // simulate small network delay for skeleton UX
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
  return BENCHMARK_COMPARISONS as BenchmarkComparison[];
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

// GET /init-async - Start async initialization
export async function startInitAsync(products: number = 1000000, transactions: number = 10000000) {
  const res = await fetch(`/init-async?products=${products}&transactions=${transactions}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Init failed");
  }
  return res.json();
}

// GET /init-status - Get initialization progress
export async function getInitStatus() {
  const res = await fetch(`/init-status`);
  if (!res.ok) throw new Error("Failed to get init status");
  return res.json();
}
