# AmazonPe Core

Dashboard para demostrar estructuras de datos avanzadas aplicadas a e-commerce: Bloom Filters, Tries para búsqueda, autocompletado y detección de fraude.

## Integrantes

1. Aracely Chavez Ascona <aracely.chavez@utec.edu.pe>
2. Christopher Mendoza Yataco <christopher.mendoza@utec.edu.pe>
3. Hans Arthur Mallma Leon <hans.mallma@utec.edu.pe>
4. Johan Agustin Barrera Alderete <johan.barrera@utec.edu.pe>
5. Jonatan Lavado Azabache <jonatan.lavado@utec.edu.pe>

## Estructuras Avanzadas Implementadas

| Estructura | Uso |
|------------|-----|
| **Bloom Filter** | Filtrado probabilístico para evitar búsquedas innecesarias en productos no existentes |
| **Trie** | Autocompletado eficiente de productos en tiempo O(m) donde m = longitud del prefijo |
| **Bloom Filter** | Detección de patrones fraudulentos en transacciones mediante similitud de hashes |
| **Count-Min Sketch** | Estimación de frecuencia de queries populares con memoria O(1) |
| **B+ Tree** | Indexación ordenada de productos para rangos y ordenamientos eficientes |
| **Priority Queue** | Encolado por prioridad de órdenes (EXPRESS > STANDARD > SCHEDULED) |

## Instalación

```bash
npm install
npm run dev
```

## Uso

Para generar los datos hacer click en el boton "GEN" o simplemente el sistema empezará a generar datos automáticamente siempre y cuando el servidor esté levantado.

## Benchmarks

Accede a `Bench.Lab` en el dashboard para comparar rendimiento:
- **Con optimización**: Bloom, Trie, CMS, Priority Queue

Verás gráficos:

<img width="461" height="532" alt="Screenshot 2026-04-22 at 10 25 31 PM" src="https://github.com/user-attachments/assets/70fff62c-92ac-4a3a-a4f3-1dff386e884b" />
