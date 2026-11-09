# HeyGoodly Project Guidelines & Rules for Coding Agents

This project is the **HeyGoodly** Affiliate & Editorial Reviews Portal (Next.js 16 + TypeScript + Tailwind CSS) powered by a high-throughput **Spring Boot 3 (Java 21) + PostgreSQL 16 + Redis + MinIO** backend. All AI agents working in this workspace must strictly adhere to the following rules:

---

## 1. 100% Database-Driven & Zero LocalStorage / Mock Data Rule (QUY TẮC CỐT LÕI)
* **Strict Ban on `useAdminCollection` & Entity `localStorage`**:
  * NEVER persist or read business entity records (`stores`, `offers`, `posts`, `categories`, `menus`, `pages`, `users`, `roles`, `feedback`, `subscribers`, `media`, `audit`) from `localStorage` under `admin:collection:*`.
  * ALL data read and write operations across both Client Portal and Admin ProCMS MUST communicate directly with PostgreSQL via Spring Boot REST APIs (`/api/v1/...`).
  * `localStorage` is strictly reserved for: user session tokens (`heygoodly:access_token`, `heygoodly:refresh_token`), user profile metadata (`heygoodly:user`), theme preference (`heygoodly:theme`), and admin UI locale (`admin:locale`).
* **Strict Ban on Mock Data Fallback & Number Fabrication**:
  * NEVER fall back to mock JSON files (`mock-articles.json`, `mock-stores.json`, `mock-deals.json`) or `DEFAULT_*` arrays when a database query returns an empty list (`[]`) or when an entity is not found.
  * Empty database query results must render cleanly as empty states (`[]`, "No matching records found"), NEVER fabricated with fake counts, fake ratings, or fake coupons.
  * If a store has 0 active coupons, display 0 coupons; never display coupons belonging to other merchants.

---

## 2. Single API per Action & On-Demand Metadata Rule (QUY TẮC TỐI ƯU HÓA API)
* **Edit Pages (`/admin/[entity]/[id]/edit`) — Strictly 1 API on Mount**:
  * When opening an edit page (e.g. `/admin/posts/[id]/edit`, `/admin/offers/[id]/edit`, `/admin/stores/[id]/edit`), the client MUST make **strictly 1 API call**: the entity detail endpoint (e.g. `GET /api/v1/admin/posts/19`).
  * **Strict Ban on Eager Metadata Preloads on Edit**: NEVER eagerly call secondary listing endpoints (such as `stores?size=100` or `categories?size=100`) during edit page mount.
  * Selection dropdowns must populate using the entity's existing record values or load options **On-Demand** (`onFocus` / `onClick`) when the user interacts with the selector.
* **List / Tab Navigation (`/admin/[entities]`) — Strictly 1 API per Tab**:
  * Navigating between admin tabs via the sidebar must only trigger the single primary data request for that module via `useServerPagination`.
  * Secondary filter dropdowns (e.g. "All Merchant Stores" on `/admin/offers`) must load options on-demand when the user focuses or clicks the dropdown.
* **Popups & Modals (Store Coupons & Media Library)**:
  * Modals must only trigger **1 single paginated API request** per user filter/page change.
  * Always use `AbortController` (e.g. `inFlightControllerRef`) to abort preceding in-flight requests when users rapidly switch tabs or type search terms.
  * Never send redundant background requests (e.g. `size=100`) just to compute tab badge counts if the backend already provides total counts.

---

## 3. Proactive JWT Refresh & Zero 401 Error Rule
* **Proactive Expiry Detection**:
  * All HTTP requests dispatched via `apiClient` (`frontend/src/lib/api/axios-client.ts`) must proactively inspect access token expiration (with a 15-second buffer) before sending.
  * If the token is expired or expiring within 15 seconds, the request interceptor MUST automatically invoke `/api/v1/auth/refresh` first, persist the new access token, and attach it to the request.
  * Prevents requests from ever reaching the server with expired tokens and eliminates red `401 TOKEN_EXPIRED` errors in browser DevTools.
* **Concurrency Protection & Safety Net**:
  * Concurrent in-flight requests during a refresh share a single active refresh promise to prevent duplicate refresh calls.
  * The response interceptor acts as a second-layer fallback; if an unexpected 401 occurs, it enqueues failed requests, refreshes the token, and replays them automatically.

---

## 4. Language, Internationalization & Theme Conventions
* **Client Portal (100% English UI)**: All public-facing texts, headings, buttons, and badges in `frontend/src/app/(client)/*` must remain strictly in English.
* **Admin ProCMS Bilingual i18n (EN / VI)**: Admin modules (`frontend/src/app/admin/*`) support English (`en`) and Vietnamese (`vi`) switching via `AdminI18nContext` (`@/context/AdminI18nContext`, stored in `localStorage` under `admin:locale`). Keep base JSX strings in English and map Vietnamese translations through `AdminI18nContext`.
* **Light & Dark Mode**: Both Client and Admin portals support Light and Dark themes via `ThemeContext` (`@/context/ThemeContext`, stored in `localStorage` under `heygoodly:theme` and applied via `html.dark`).

---

## 5. Route & Canonical Link Conventions
* Always import and use `ROUTES` from `@/constants/routes`:
  * Article / Review Detail: `ROUTES.PUBLIC.POST_DETAIL(slug)` (`/post/[slug]`)
  * Review Directory: `ROUTES.PUBLIC.POSTS` (`/posts`)
  * Store Detail: `ROUTES.PUBLIC.STORE_DETAIL(slug)` (`/store/[slug]`)
  * Outbound Affiliate redirects: `/out/[id]` and `/go/[slug]`
* Avoid creating duplicate, diverging routes for the same entity.
* Canonical URLs must always use `SITE_URL` from `@/constants/site`.

---

## 6. Frontend Quality & Build Standards
* **Always verify TypeScript validity before completing any task**:
  ```bash
  cd frontend && npx tsc --noEmit -p .
  ```
  Ensure 0 compilation errors across all files.
* **Strict Native Popup Ban**: Never use `window.alert()`, `window.confirm()`, or `window.prompt()` in frontend code. Always use ProCMS floating Toasts (`toast.success()`, `toast.error()`) and modern confirmation dialogs (`confirmModal`).
* **Table of Contents (TOC)**: Intentionally disabled across both articles and `RichTextEditor`. Do not re-introduce it unless explicitly requested.
* **Pagination Component Integrity**:
  * Pagination bars (`<< < 1 2 > >>`) must ALWAYS render consistently across tables and modals, even when `totalPages === 1`.
  * Total item indicators must maintain the total library/dataset count without collapsing when a single tag or filter is active.

---

## 7. Backend Architecture & High-Scalability Standards (Spring Boot 3 + PostgreSQL 16)
* **Architecture**: Modular Monolith organized by domain (`modules/{auth, store, offer, post, affiliate, file, media, audit, user}`).
* **Strict No JPA Relationship Rule (No @ManyToOne / @OneToMany / @ManyToMany / @OneToOne)**:
  * Entities must NEVER declare JPA relational object annotations (`@ManyToOne`, `@OneToMany`, `@ManyToMany`, `@OneToOne`).
  * Always use primitive Foreign Key IDs: `private Long storeId;`, `private Long categoryId;`, `private Long authorId;`, `private Long userId;`.
  * Rationale: Eliminates Hibernate N+1 query traps, proxy serialization loops, lazy-loading exceptions, and keeps modules 100% decoupled for future microservice extraction.
* **Zero N+1 Query & No Query in Loop Rule**:
  * NEVER execute repository or database queries inside a `for`, `while`, or `.map(...)` loop.
  * Always collect IDs into a `Set<Long>` and batch fetch using `repository.findAllById(ids)` or `IN (:ids)` in a single query.
  * Map batch results to a `Map<Long, T>` in memory for O(1) correlation.
* **No Literal String & StringBuilder Rule (Cấm dùng "" hoặc + chuỗi)**:
  * NEVER concatenate strings with the `+` operator. Always use `StringBuilder` for dynamic string construction.
  * NEVER write bare literal strings (`""`, `"system"`, `"userId"`). All symbols, claim keys, headers, and constants must be declared and imported from constant classes (`AppConstants`, `SecurityConstants`, `HttpHeaderConstants`, `AffiliateConstants`).
* **Enum, Parameter Object & Defensive Null-Safety Rules**:
  * **Use Enums**: All domain statuses, entity types, affiliate networks, and roles MUST be typed Java `enum`s. Never use arbitrary magic strings.
  * **Parameter Object Pattern**: Any service or repository method accepting $\ge 3$ parameters (e.g. search, filters, pagination) MUST encapsulate arguments into a single cohesive Query/Criteria Object.
  * **Defensive Null-Safety**: Always prevent `NullPointerException` (NPE) by using `NullSafeUtils` (`safeTrim()`, `safeLowerTrim()`, `safeBoolean()`, `safeList()`) before invoking operations on request payloads.
* **High-Throughput Redis Patterns**:
  * Outbound link redirects (`/out/{code}`) must be resolved from Redis cache before querying PostgreSQL.
  * Atomic counter aggregation (`INCR heygoodly:counter:*`) for clicks and views, flushed in batches to PostgreSQL via `@Scheduled` to prevent row-lock contention.
  * Rate-limiting and 2FA lockout (`heygoodly:auth:lockout:{email}`) managed via Redis.
* **MinIO Object Storage**:
  * Never store uploaded files on local server disk. Always stream or upload to MinIO bucket `heygoodly-media` with organized prefixes (`articles/`, `stores/`, `avatars/`, `banners/`).
  * PostgreSQL only stores public access URLs and S3 object keys.
* **Database Migrations**: All schema changes must be declared via Liquibase SQL changesets under `backend/src/main/resources/db/changelog/changes/`.
* **Database-Driven Auth & 2FA Zero-Hardcoding Rule**:
  * NEVER hardcode passwords, test OTP codes, or backup recovery codes in Java code.
  * All credentials MUST be validated via `passwordEncoder.matches(rawPassword, user.getPasswordHash())` against PostgreSQL `users.password_hash`.
  * All 2FA engine configurations (issuer, window size tolerance, dev bypass toggle, dev test codes) MUST be loaded dynamically from PostgreSQL `system_settings` via `SettingService`.
* **DevOps & CI/CD**:
  * Docker Compose (`docker-compose.yml`) configures Postgres 16, Redis 7, MinIO (with auto-bucket creation), Spring Boot, and Next.js.
  * GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, maven tests, and compose validation on PR/push.
