# AmazonPe Core

Dashboard para demostrar estructuras de datos avanzadas aplicadas a e-commerce: Bloom Filters, Tries y LSH para búsqueda, autocompletado y detección de fraude.

## Estructuras Avanzadas Implementadas

| Estructura | Uso |
|------------|-----|
| **Bloom Filter** | Filtrado probabilístico para evitar búsquedas innecesarias en productos no existentes |
| **Trie** | Autocompletado eficiente de productos en tiempo O(m) donde m = longitud del prefijo |
| **LSH** | Detección de patrones fraudulentos en transacciones mediante similitud de hashes |
| **Count-Min Sketch** | Estimación de frecuencia de queries populares con memoria O(1) |
| **B+ Tree** | Indexación ordenada de productos para rangos y ordenamientos eficientes |
| **Priority Queue** | Encolado por prioridad de órdenes (EXPRESS > STANDARD > SCHEDULED) |

## Instalación

```bash
npm install
npm run dev
```

## Uso

```bash
python src/main.py --dataset data/dataset_10M.csv
```

## Benchmarks

Accede a `/benchmark` en el dashboard para comparar rendimiento:
- **Con optimización**: Bloom, Trie, CMS, Priority Queue
- **Baseline**: Búsqueda lineal O(n), sin indexación

Verás gráficos de tiempo/memoria vs tamaño de datos (N) y tabla de speedup.