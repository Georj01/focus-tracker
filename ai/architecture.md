# SYSTEM INSTRUCTIONS: ARCHITECTURE & SYSTEM DESIGN

> **[TEMPLATE WARNING - FOR THE DEVELOPER]**
> Update this file for EVERY new project. Define the structural logic here so the AI doesn't hallucinate or mix design patterns. Remove these bracketed notes when starting a new project.

## 1. HIGH-LEVEL ARCHITECTURE
- **Core Pattern:** [e.g., Client-Server SPA, Hexagonal Architecture, MVC, Serverless, Simple CLI script]
- **Infrastructure:** [e.g., Deployed on Vercel, Dockerized backend, Local execution only]

## 2. DATA FLOW & STATE MANAGEMENT
- **Source of Truth:** [e.g., PostgreSQL database via Supabase, Local JSON file, Memory-only]
- **State Strategy:** [e.g., React Context for global state, Zustand, no global state needed]
- **Data Fetching:** [e.g., Server Components only, SWR/React Query, native fetch]
- **Strict Rule:** The UI layer MUST NOT mutate data directly. All mutations must pass through [e.g., designated services, controllers, or server actions].

## 3. COMMUNICATION & API DESIGN
- **Protocol:** [e.g., RESTful, GraphQL, tRPC, None (internal script)]
- **Data Payload:** [e.g., Always return standard JSON objects with `{ data, error }` structure].

## 4. ERROR HANDLING STRATEGY
- **Global Strategy:** [e.g., Use Error Boundaries in the frontend, global exception middleware in the backend].
- **Failing Gracefully:** The application must NEVER crash completely for the user. Catch exceptions at the boundaries, log the error quietly, and display a fallback UI or clear terminal message.

## 5. SECURITY & AUTHENTICATION
- **Auth Flow:** [e.g., JWT stored in HTTP-only cookies, OAuth2 via Google, None required].
- **Boundaries:** [e.g., All API routes must verify user session before executing any logic].