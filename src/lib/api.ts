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
  LsmDebugResponse,
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
//// export function autocomplete(q: string) {
////   const optimized = getOptimizedFlag();
////   return mockFetch(`/autocomplete?q=${encodeURIComponent(q)}&optimized=${optimized}`, () => {
////     const term = q.trim().toLowerCase();
////     if (!term) return { suggestions: [] as string[] };
////     const suggestions = AUTOCOMPLETE_TERMS.filter((s) => s.toLowerCase().includes(term)).slice(0, 8);
////     return { suggestions };
////   }) as Promise<{ suggestions: string[] }>;
//// }
export async function getAutocomplete(q: string) {
  // Return early if the query is empty to avoid unnecessary backend calls
  if (!q || q.trim() === "") return [];

  const isOptimized = getOptimizedFlag();
  const path = `/autocomplete?q=${encodeURIComponent(q)}&optimized=${isOptimized}`;

  return mockFetch(path, () => {
    // This callback is used if USE_MOCKS is true. 
    // We filter your mock AUTOCOMPLETE_TERMS based on the query.
    const queryLower = q.toLowerCase();
    
    // Assuming AUTOCOMPLETE_TERMS is an array of strings or objects with a 'name' property
    return AUTOCOMPLETE_TERMS
      .filter((term: any) => {
         const text = typeof term === 'string' ? term : term.name;
         return text.toLowerCase().startsWith(queryLower);
      })
      .slice(0, 10)
      .map((term: any, index: number) => ({
        id: typeof term === 'string' ? `mock-${index}` : term.id,
        name: typeof term === 'string' ? term : term.name,
        sales: 0
      }));
  });
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
///// export async function getBenchmarkComparisons(): Promise<BenchmarkComparison[]> {
/////   // simulate small network delay for skeleton UX
/////   await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
/////   return BENCHMARK_COMPARISONS as BenchmarkComparison[];
///// }

export async function getBenchmarkComparisons(): Promise<BenchmarkComparison[]> {
  try {
    const response = await fetch('/api/benchmark-comparisons');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch benchmark comparisons: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Benchmark API Error:", error);
    // Fallback to mock data if the backend isn't ready or times out
    return BENCHMARK_COMPARISONS as BenchmarkComparison[];
  }
}

// GET /api/priority-orders?page=&limit=
////////export function getPriorityOrders(page = 1, limit = 20) {
////////  return mockFetch(`/priority-orders?page=${page}&limit=${limit}`, () => {
////////    const start = (page - 1) * limit;
////////    const items = PRIORITY_ORDERS.slice(start, start + limit);
////////    return {
////////      items,
////////      page,
////////      limit,
////////      total: PRIORITY_ORDERS.length,
////////      hasMore: start + limit < PRIORITY_ORDERS.length,
////////    } as { items: PriorityOrder[]; page: number; limit: number; total: number; hasMore: boolean };
////////  });
////////}
export async function getPriorityOrders(page = 1, limit = 20) {
  try {
    const response = await fetch(`/api/priority-orders?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch priority orders: ${response.status}`);
    }

    const data = await response.json();

    // Map the backend structure to the format expected by the frontend
    // Backend: { orders, page, limit, total, pages }
    // Frontend expects: { items, page, limit, total, hasMore }
    return {
      items: data.orders as PriorityOrder[],
      page: data.page,
      limit: data.limit,
      total: data.total,
      hasMore: data.page < data.pages, // Calculate hasMore based on total pages
    };
  } catch (error) {
    console.error("Priority Orders API Error:", error);
    // Return empty state to prevent UI crash
    return {
      items: [],
      page,
      limit,
      total: 0,
      hasMore: false,
    };
  }
}


// GET /api/lsm-debug
//////export function getLsmDebug() {
//////  return mockFetch(`/lsm-debug`, () => LSM_LOG as LsmEvent[]);
//////}
// GET /api/lsm-debug
// Update this in api.ts

export async function getLsmDebug(): Promise<LsmDebugResponse> {
  try {
    const response = await fetch('/api/lsm-debug');
    if (!response.ok) throw new Error("Failed to fetch LSM state");
    
    const data = await response.json();

    // 1. Helper to map backend Python event names to our UI badge types
    const mapEventType = (backendEvent: string) => {
      if (!backendEvent) return 'READ';
      if (backendEvent.includes('flush')) return 'FLUSH';
      if (backendEvent.includes('minor')) return 'MERGE';
      if (backendEvent.includes('compaction')) return 'COMPACT';
      return 'READ';
    };

    // 2. Normalize the timeline events
    const cleanedTimeline = (data.timeline || []).map((e: any) => {
      // Extract data from the nested 'details' dictionary
      const details = e.details || {};
      const sizeMb = details.size_mb || 0;
      
      // Build a clean description string for the UI
      const detailStr = `Processed ${details.entries_written || 0} writes, ${details.entries_removed || 0} deletions.`;

      return {
        ...e,
        id: e.id || `evt-${Math.random().toString(36).substr(2, 9)}`,
        type: mapEventType(e.event),
        // Ensure timestamp is a valid ISO string
        timestamp: typeof e.timestamp === 'number' 
          ? new Date(e.timestamp * 1000).toISOString() 
          : e.timestamp || new Date().toISOString(),
        // Convert Backend's MB to Frontend's raw Bytes
        bytes: Math.floor(sizeMb * 1024 * 1024),
        level: Number(e.level) || 0,
        detail: detailStr,
        key: details.key || null
      };
    });

    // 3. Normalize the Tree Levels for the Sidebar
    const backendLevels = data.lsm_state?.levels || [];
    const cleanedLevels = backendLevels.map((l: any) => ({
      level: l.level,
      // Map the length of the sstables array to 'count'
      count: Array.isArray(l.sstables) ? l.sstables.length : 0,
      // Convert Backend's MB to Frontend's raw Bytes
      size_bytes: (l.current_size_mb || 0) * 1024 * 1024
    }));

    return {
      description: data.description || "LSM Tree Status",
      lsm_state: { ...data.lsm_state, levels: cleanedLevels },
      timeline: cleanedTimeline
    };
  } catch (error) {
    console.error("LSM API Error:", error);
    // Return empty fallback state to prevent crashes on network failure
    return {
      description: "Error loading state",
      lsm_state: { levels: [] },
      timeline: []
    };
  }
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
