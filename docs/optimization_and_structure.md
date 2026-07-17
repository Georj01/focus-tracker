# OPTIMIZATION & STRUCTURAL PURITY MANIFESTO

## 1. DIRECTORY SYMMETRY
- **No Loose Files:** The root directory is EXCLUSIVELY for configuration files (`.gitignore`, `README.md`, `.env`, `requirements.txt`). Any source code found in the root will be immediately moved to `src/` or rejected.
- **Categorical Isolation:** UI code does not mix with database logic. DCTL algorithms must live in isolated `dctl/` or `shaders/` directories.

## 2. EXTREME CODE COMPRESSION
- **Vectorization over Iteration:** In Python/Data analysis, `for` loops iterating over arrays are strictly forbidden. Use NumPy/Pandas vectorized operations. 
- **Mathematical Shortcuts:** Use bitwise shifts (`>>`, `<<`) instead of multiplication/division by powers of 2. Use modulo arithmetic to avoid cyclic `if/else` conditions.
- **Ternary & Comprehensions:** Collapse simple `if/else` blocks into ternary operators. Collapse list-building loops into list comprehensions.

## 3. MANDATORY MICRO-DOCUMENTATION
- **Zero-Assumption Rule:** Do not assume the reader knows the mathematical formula behind a function. Provide the LaTeX equivalent or the academic name of the algorithm in the docstring.
- **Inline OCD:** Variables must be documented at the point of declaration. Logic gates must explain the *business* or *math* reason for the condition, not just translate the code to English.

## 4. FORMATTING & ENCODING
- **UTF-8 Strict:** All files must be UTF-8 encoded without BOM.
- **Alignment:** Block variable assignments must have their `=` signs perfectly aligned vertically to ensure visual symmetry.
