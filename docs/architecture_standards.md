# ARCHITECTURE & ENGINEERING STANDARDS (THE GOLD STANDARD)

## 1. ALGORITHMIC EFFICIENCY (TIME & SPACE COMPLEXITY)
- **Big-O Enforcement:** Any nested loops or recursive functions must be explicitly justified. Unnecessary O(N^2) or O(2^N) operations will be immediately rejected. Use Hash Maps, Sets, or optimized matrix operations instead of brute-force iterations.
- **Memory Footprint:** In Python and data pipelines, lazy evaluation (Generators, Iterators) is mandatory for large datasets. Loading entire files into RAM simultaneously is a fireable offense.

## 2. STRUCTURAL MODULARITY (SOLID PRINCIPLES)
- **Single Responsibility:** A function does one thing. A class represents one concept. If a script exceeds 300 lines or a function exceeds 40 lines of pure logic, it must be refactored and decoupled.
- **No Circular Dependencies:** Import graphs must be strictly unidirectional. 

## 3. GRAPHICS & MATH PIPELINES (DCTL / SHADERS)
- **Precision First:** All floating-point math must explicitly handle edge cases (NaN, Infinity).
- **Operation Cost:** Division is expensive; multiply by the reciprocal where possible. Branching (`if/else`) inside per-pixel loops must be eliminated or minimized using step functions or math approximations. 

## 4. DATABASE INTEGRITY
- **Normalization vs. Performance:** Schemas must adhere to 3NF by default. Denormalization is only permitted if accompanied by a benchmark proving a critical read-performance bottleneck.
- **Index Optimization:** Any query filtering by a specific column must have a corresponding index. Full table scans on production data are strictly forbidden.
