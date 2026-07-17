# SECURITY POLICIES (ZERO-TOLERANCE RULES)

## 1. DATA HANDLING & SANITIZATION
- **Trust No Input:** All user input (forms, API payloads, URL parameters) must be treated as malicious. Mandatory sanitization before processing.
- **Strict Typing:** All data structures must use strict type casting (e.g., Pydantic in Python). If a function expects an integer, it must crash on receiving a string, not attempt to cast it silently.
- **SQL Execution:** Direct concatenation of variables into SQL strings is forbidden. All database interactions MUST use Parameterized Queries or a verified ORM.

## 2. SECRETS & CREDENTIAL MANAGEMENT
- **Environment Variables Only:** No hardcoded API keys, database URIs, or tokens anywhere in the codebase. All secrets must be loaded from `.env` via `os.getenv` or similar environment managers.
- **Logs Sterilization:** Logging frameworks must be configured to strip passwords, tokens, and PII (Personally Identifiable Information) before writing to stdout or disk.
- **Git Ignorance:** Files containing secrets (`.env`, `credentials.json`) must be explicitly declared in `.gitignore`.

## 3. ACCESS CONTROL & AUTHENTICATION
- **Default Deny:** Every endpoint or critical function must deny access by default unless an explicit permission check is passed.
- **Stateless Tokens:** If using JWT, tokens must have a strict expiration time (max 15 minutes for access tokens) and signature verification must never be bypassed (`verify=False` is forbidden).

## 4. MATHEMATICAL & PIPELINE INTEGRITY (DCTL/C)
- **Bounds Checking:** Any script manipulating arrays, pixels, or specific memory locations must implement bounds checking.
- **Zero-Division Prevention:** All mathematical dividers must include a fallback or clamping mechanism (e.g., `max(divider, 1e-6)`) to prevent critical crashes.

## 5. DEPENDENCY MANAGEMENT
- **Pinned Versions:** All external libraries must have pinned versions in requirements/package managers (e.g., package.json, requirements.txt, poetry.lock) to prevent supply chain attacks.
