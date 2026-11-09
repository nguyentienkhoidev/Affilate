---
name: heygoodly-affiliate-portal
description: >-
  Comprehensive development, architectural, and operational guide for the HeyGoodly Affiliate & Editorial Reviews Portal.
  Use this skill whenever building, modifying, refactoring, or debugging code in this repository, including Client Portal
  pages (reviews, stores, categories, search, coupon popup), Admin ProCMS modules, RichTextEditor components, and affiliate tracking logic.
---

# HeyGoodly Affiliate Portal & ProCMS Skill Guide

HeyGoodly is an editorial product review journal and verified merchant coupon platform built with:
* **Frontend**: **Next.js 16 (App Router, TypeScript, Tailwind CSS)** with Client Portal and ProCMS Enterprise Admin.
* **Backend**: **Spring Boot 3 (Java 21) + PostgreSQL 16 + Redis + MinIO** structured as a high-throughput, horizontally scalable Modular Monolith.

---

## 1. Canonical Route Map (`src/constants/routes.ts`)

| Entity | Canonical Route | Legacy 308 Redirects |
| :--- | :--- | :--- |
| **Homepage** | `/` (`ROUTES.PUBLIC.HOME`) | — |
| **Editorial Archive** | `/posts` (`ROUTES.PUBLIC.POSTS`) | `/articles`, `/deals` |
| **Review Detail** | `/post/[slug]` (`ROUTES.PUBLIC.POST_DETAIL(slug)`) | `/posts/[slug]`, `/articles/[slug]` |
| **Stores Directory** | `/stores` (`ROUTES.PUBLIC.STORES`) | — |
| **Store Affiliate Hub** | `/store/[slug]` (`ROUTES.PUBLIC.STORE_DETAIL(slug)`) | `/stores/[slug]`, `/deals/[slug]` |
| **Category Archive** | `/category/[slug]` (`ROUTES.PUBLIC.CATEGORY_DETAIL(slug)`) | — |
| **Topic Tag Archive** | `/tag/[slug]` (`ROUTES.PUBLIC.TAG_DETAIL(slug)`) | — |
| **Universal Search** | `/search?q=...` (`ROUTES.PUBLIC.SEARCH`) | — |
| **Outbound Redirects** | `/go/[slug]` & `/out/[id]` (HTTP 307 + `noindex, nofollow`) | — |

* Always use `SITE_URL` / `absoluteUrl()` from [`src/constants/site.ts`](file:///Users/khoinguyen/Documents/Affilate/frontend/src/constants/site.ts) when building canonical URLs, JSON-LD `@id`s, or `sitemap.ts` entries.

---

## 2. ProCMS Frontend Architecture & Data Guidelines

1. **100% Database-Driven — Zero LocalStorage for Entity Data**:
   * All business entities (`stores`, `offers`, `posts`, `categories`, `menus`, `pages`, `users`, `roles`, `feedback`, `subscribers`, `media`, `audit`) are persisted directly to PostgreSQL via Spring Boot REST APIs (`/api/v1/...`).
   * Never store entity collections in `localStorage` under `admin:collection:*`.
   * Never fabricate fallback data or fallback to local mock JSON when an entity is missing or a search yields 0 results. Empty results must render as empty states (`[]`).
2. **Single API per Action / Edit Rule**:
   * **Edit Pages (`/admin/[entity]/[id]/edit`)**: When opening an edit page, make **strictly 1 API call**: the entity detail endpoint (e.g. `GET /api/v1/admin/posts/19`).
   * **Ban on Eager Metadata Preload on Edit**: Do not eagerly fetch `stores?size=100` or `categories?size=100` during edit mount. Dropdown selections must use existing record values or load options **On-Demand** (`onFocus` / `onClick`).
   * **List/Tab Navigation**: Clicking an admin tab from the sidebar only triggers that tab's single primary paginated listing request. Dropdown filter options must be loaded on demand.
   * **Popups / Modals**: Store coupons modals and media dialogs must only send **1 single paginated API request** per action. Always attach `AbortController` to cancel in-flight duplicate requests.
3. **Proactive JWT Refresh & Zero 401 Rule**:
   * `apiClient` (`axios-client.ts`) checks token expiration (with a 15-second buffer) before sending any request.
   * If token is expired or expiring soon, it automatically calls `/api/v1/auth/refresh` first and attaches the fresh token, completely eliminating visible red `401 TOKEN_EXPIRED` errors in browser DevTools.
4. **Media Library Modal Standards**:
   * Pagination controls (`<< < 1 2 > >>`) must ALWAYS render consistently, even when `totalPages === 1` or after filtering by a tag.
   * Total item counter (`All ({totalLibraryAssets})`) must be preserved independently of the active tag filter.
5. **Strict Native Popup Ban**:
   * **Never** use browser native `window.alert()`, `window.confirm()`, or `window.prompt()`.
   * Always use floating ProCMS Toasts (`toast.success()`, `toast.error()`) and modern confirmation dialogs (`confirmModal`).
6. **Authentication & 2FA Flow**:
   * Admin login dynamically checks 2FA status based on email.
   * If 2FA is active, show the 6-digit TOTP input with auto-verify as soon as the 6th digit is entered.
   * Validation errors must trigger non-blocking floating toasts.

---

## 3. Backend Architecture: Spring Boot 3 + PostgreSQL + Redis + MinIO

### 3.1. Modular Monolith Architecture
Backend is organized under `backend/src/main/java/com/heygoodly/portal/`:
* `common/`: Core abstractions (`BaseEntity`, `ApiResponse<T>`, `PageResponse<T>`, `GlobalExceptionHandler`).
* `config/`: Spring Security (JWT + TOTP filter), Redis caching, MinIO client configuration.
* `modules/`: Fully encapsulated feature modules:
  * `auth`: Authentication, JWT issue/refresh, 2FA TOTP setup & verification.
  * `store`: Merchant profiles, affiliate network bindings, ratings, FAQs JSONB.
  * `offer`: Coupons, deals, discount structures, exclusive badges.
  * `post`: Editorial reviews, categories, tags JSONB, sidebar widget configs.
  * `affiliate`: High-throughput `/out/{clickCode}` and `/go/{slug}` redirection engine.
  * `file` & `media`: MinIO S3 integration for WebP conversion, media item entity indexing with JSONB tags, and asset metadata.
  * `audit`: ProCMS tracing & change diff logging.
  * `user`: Staff RBAC accounts and profile management.

### 3.2. Strict Entity Rule: No JPA Relationships (@Many... / @One...)
* **Do NOT use `@ManyToOne`, `@OneToMany`, `@ManyToMany`, or `@OneToOne`** across entities.
* **Always reference by Aggregate ID**:
  * Instead of `private StoreEntity store;`, use `@Column(name = "store_id") private Long storeId;`.
  * Instead of `private CategoryEntity category;`, use `@Column(name = "category_id") private Long categoryId;`.
  * Instead of `private UserEntity author;`, use `@Column(name = "author_id") private Long authorId;`.

### 3.3. Zero N+1 Query & Batch Fetching Rule
* **NEVER query database inside loops**: Calling `repository.findById()` inside `for`, `while`, or `.map(...)` is strictly forbidden.
* **Batch Fetch Pattern**:
  1. Collect target Foreign Key IDs into a `Set<Long>`:
     `Set<Long> parentIds = entities.stream().map(E::getParentId).filter(Objects::nonNull).collect(toSet());`
  2. Query all references in ONE single SQL batch query:
     `Map<Long, String> nameMap = repository.findAllById(parentIds).stream().collect(toMap(E::getId, E::getName));`
  3. Correlate in memory in $O(1)$ time. Total database queries executed: strictly **2 queries** regardless of dataset size.
* **No Literal String & StringBuilder Rule**:
  * Never concatenate strings with `+`. Always use `StringBuilder`.
  * Never use bare literal strings or `""`. Use constants from `AppConstants` (e.g. `AppConstants.EMPTY`, `AppConstants.PERCENT`), `SecurityConstants`, `HttpHeaderConstants`, `AffiliateConstants`.
* **Enum & Parameter Object Pattern**:
  * Represent all statuses, types, and networks as Java `enum`s.
  * Encapsulate method signatures with $\ge 3$ parameters into a dedicated Criteria/Query DTO to prevent parameter explosion.
* **Defensive Null-Safety**:
  * Eradicate `NullPointerException` (NPE) by applying `NullSafeUtils.safeTrim()`, `safeBoolean()`, and `safeList()`.
* **i18n for Error Codes**: All exceptions must throw `AppException(ErrorCode.<CODE>)` which maps to bilingual translations in `i18n_messages`.

### 3.4. Database & Liquibase Changesets
Database changes are strictly managed via Liquibase in `backend/src/main/resources/db/changelog/changes/`:
* `001-initial-schema.sql`: 14 production-ready relational tables with proper indexes (B-Tree & GIN for JSONB).
* `002-seed-permissions-and-roles.sql`: RBAC matrix (Super Admin, Admin, Editor, Author).
* `003-seed-demo-data.sql`: Seed data for stores, offers, categories, posts, pages, and menus.
* `008-seed-media-items.sql`: Media library assets with JSONB tags.

### 3.5. High-Throughput Redis Patterns
1. **Outbound Redirect Caching**:
   * Target URL cached at `heygoodly:redirect:{click_code}` (TTL: 1h). Sub-millisecond 302/307 response without hitting PostgreSQL.
2. **Write-Behind Atomic Counters**:
   * Outbound clicks: `INCR heygoodly:counter:store:clicks:{storeId}` and `heygoodly:counter:offer:clicks:{offerId}`.
   * Post reads: `INCR heygoodly:counter:post:views:{postId}`.
   * Flushed to PostgreSQL in batches every 5 minutes via `@Scheduled(fixedRate = 300000)` to eliminate row-lock contention.
3. **Security & Rate Limiting**:
   * 2FA & Brute Force lockout: `heygoodly:auth:lockout:{email}` (TTL: 15m).
   * JWT Blacklist on logout: `heygoodly:token:blacklist:{jti}`.

### 3.6. MinIO S3 Object Storage Guidelines
* **Bucket**: `heygoodly-media` (Public Read for CDN, Private Write via Minio Client SDK).
* **Key Hierarchies**:
  * Articles: `articles/{yyyy}/{mm}/{uuid}.webp`
  * Stores: `stores/{slug}-{uuid}.webp`
  * Avatars: `avatars/{userId}.webp`
* The application server handles image compression/conversion to WebP before uploading to MinIO. PostgreSQL only stores the final access URL and MinIO object key.

### 3.7. Database-Driven Authentication & 2FA Zero-Hardcoding Standards
* **Zero Hardcoded Passwords**: Never match plaintext passwords against hardcoded string literals in Java code. All credentials must strictly be verified using `passwordEncoder.matches(request.getPassword(), user.getPasswordHash())` against BCrypt hashes stored in PostgreSQL `users.password_hash`.
* **Zero Hardcoded OTP & Recovery Codes**: Never hardcode test OTP codes (`884219`, `123456`) or recovery codes (`8A41-92F0`) directly in Java.
* **Dynamic Security Configurations from PostgreSQL (`system_settings`)**:
  * All 2FA and Auth engine parameters are retrieved dynamically at runtime via `SettingService.getSettingValue(key, defaultValue)`:
    * `two_factor_issuer`: Issuer name rendered in the `otpauth://` QR Code.
    * `two_factor_window_size`: Time-step tolerance window for RFC 6238 TOTP clock drift (default: `3`).
    * `two_factor_dev_bypass_enabled`: Dynamic database toggle (`true`/`false`) for developer bypass codes.
    * `two_factor_dev_otp`: Dev OTP bypass code loaded from DB.
    * `two_factor_dev_recovery_code`: Dev emergency recovery backup code loaded from DB.
    * `auth_max_failed_attempts` & `auth_lockout_seconds`: Brute-force lockout constraints.

---

## 4. RichTextEditor Specifications

Located at [`src/components/admin/RichTextEditor.tsx`](file:///Users/khoinguyen/Documents/Affilate/frontend/src/components/admin/RichTextEditor.tsx):
* **Full Width**: Spans 100% horizontal width of its parent form container.
* **In-Article Widgets**: Promo Deal Box (`deal`), Testing Tip (`tip`), Warning (`warning`), Verdict (`verdict`), Pros & Cons (`pros-cons`), and CTA Button (`button`).
* **No TOC**: Table of Contents is intentionally disabled across both Admin and Client.

---

## 5. Pre-Completion Verification Standards

Always verify TypeScript integrity before finishing any task:
```bash
cd /Users/khoinguyen/Documents/Affilate/frontend && npx tsc --noEmit -p .
```
Must pass with 0 errors.
