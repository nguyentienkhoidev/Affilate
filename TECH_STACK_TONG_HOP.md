# TỔNG HỢP TOÀN BỘ TECHSTACK HỆ THỐNG
## CỔNG TIN TỨC & MÃ GIẢM GIÁ AFFILIATE (BARGORYA & PROCMS)
*(Cập nhật chuẩn hóa: Java 21, Spring Boot 3.x, Liquibase, GitHub Actions, Next.js cho Client & Admin, PostgreSQL, Không dùng Redis)*

---

## 1. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ (SYSTEM ARCHITECTURE)

```
[ NGƯỜI DÙNG TỪ GOOGLE / TIKTOK / FACEBOOK / INSTAGRAM ]
                           │
                           ▼
                  [ CLOUDFLARE CDN ]
        (Bảo vệ DDoS, Cấp SSL, Cache ảnh WebP toàn cầu)
                           │
                           ▼
              [ VPS: NGINX REVERSE PROXY ]
              (Port 80/443 - Cấp chứng chỉ SSL)
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
[ Tĩnh: /uploads/ ]    [ /api/* ]       [ Giao diện: /* ]
(Phục vụ ảnh đĩa)   (Spring Boot 3)     (Next.js App)
         │                 │            ├── Client: /*
         ▼                 │            └── Admin:  /admin/*
   /var/www/uploads/       ▼
   (Ổ cứng VPS)     [ DOCKER NETWORK ]
                     ┌─────┴─────┐
                     ▼           ▼
             [ Spring Boot 3 ] [ PostgreSQL 16 ]
             (Java 21 LTS)     (Quản lý bởi Liquibase)
```

---

## 2. CHI TIẾT TỪNG TẦNG CÔNG NGHỆ (TECHSTACK BREAKDOWN)

### 2.1. FRONTEND: NEXT.JS 14+ (Cho cả 2 trang Client & Admin)
Hệ thống sử dụng **Next.js 14+ (App Router, TypeScript)** để phát triển đồng nhất cả 2 phân hệ:

1. **Trang Client (Cổng Thông tin Độc giả & Store Affiliate):**
   - **Đường dẫn:** `/*` (Trang chủ, Chi tiết bài viết review, Trang Store săn mã coupon, Danh mục).
   - **Cơ chế:** **SSR (Server-Side Rendering)** kết hợp **ISR (Incremental Static Regeneration)** giúp:
     * Điểm SEO Google Core Web Vitals tối đa, Googlebot index bài viết tức thì.
     * Tải trang siêu tốc (< 1.2s trên mạng 4G/5G) khi khách click từ **TikTok Bio, Facebook Post, Instagram Bio**.
     * Xử lý cơ chế popup "Get Code" và chuyển tiếp affiliate mượt mà trên Mobile Webview.
2. **Trang Admin (Hệ thống Quản trị ProCMS):**
   - **Đường dẫn:** `/admin/*` (hoặc `/backend/*` theo ảnh mẫu).
   - **Cơ chế:** **CSR (Client-Side Rendering)** dạng Single Page Application hiện đại.
   - **Giao diện:** **TailwindCSS** + **Shadcn UI** (tối ưu bảng dữ liệu, bộ lọc nâng cao, ma trận phân quyền checkbox).
   - **Trình soạn thảo:** **CKEditor 5** hoặc **Tiptap** chèn ảnh, bảng so sánh sản phẩm, link affiliate nofollow.
3. **Quản lý State & Gọi API:** **TanStack Query (React Query)** + **Axios** kết nối tới Backend Spring Boot qua chuẩn REST API.
4. **Tiêu chuẩn Thiết kế Tương thích Đa thiết bị (Responsive Design Breakpoints):**
   - Áp dụng hệ thống TailwindCSS Breakpoints chuẩn:
     * **Mobile (< 640px):** Bố cục 1 cột, menu Off-canvas Drawer, nút "Get Code" to bản (chuẩn Touch target Apple >= 48px), Popup modal co giãn dạng Bottom Sheet vừa vặn màn hình điện thoại; tương thích 100% Webview của TikTok, Facebook, Instagram, Zalo.
     * **Tablet (768px - 1023px):** Bố cục tự co giãn 2 cột cân đối; Admin ProCMS chuyển sang Mini Sidebar Icon để giữ không gian rộng rãi.
     * **Desktop (>= 1024px):** Bố cục đa cột chuẩn tạp chí: Header banner 728x90, Hero featured + 4 bài Editor Pick, Grid 3 cột Business, Split 1 lớn + 3 nhỏ Tech, Sidebar cố định.

---

### 2.2. BACKEND API: SPRING BOOT 3.x & JAVA 21 (LTS)
Toàn bộ logic nghiệp vụ, phân quyền và dữ liệu được điều khiển bởi Spring Boot:

* **Nền tảng:** **Java 21 LTS** (tận dụng Virtual Threads xử lý đồng thời hàng ngàn request, Records, Pattern Matching) + **Spring Boot 3.x** (Spring Framework 6).
* **Kiến trúc mã nguồn (Clean Architecture & DTO Pattern):**
  * `Controller` ➡️ `Service` ➡️ `Repository` ➡️ `Entity`.
  * **Bắt buộc tuân thủ DTO:** Tuyệt đối không trả JPA `@Entity` ra `@RestController`. Mọi endpoint đều giao tiếp qua `RequestDTO` và `ResponseDTO`.
  * **Constructor Injection:** Dùng Lombok `@RequiredArgsConstructor` kết hợp `private final` cho mọi dependency injection.
* **Bảo mật & Phân quyền RBAC động:**
  * **Spring Security 6** + **JWT (JSON Web Token)**: Access Token ngắn hạn + Refresh Token an toàn.
  * **Xác thực 2 bước (2FA):** Chuẩn TOTP (RFC 6238) tích hợp với Google Authenticator / Microsoft Authenticator / Authy.
  * **Kiểm tra quyền động:** Dùng `@PreAuthorize("hasAuthority('post.create')")` bảo vệ chặt chẽ từng API.
* **Xử lý Hình ảnh & Nén Media:** Thư viện **Thumbnailator** (`net.coobird:thumbnailator`):
  * Tự động nén sang định dạng **WebP** (giảm 70% dung lượng ảnh).
  * Tự động sinh phiên bản Thumbnail (300px) và Full-size (1200px) trước khi ghi ra ổ cứng.

---

### 2.3. CƠ SỞ DỮ LIỆU: POSTGRESQL 16 & LIQUIBASE (MIGRATION)
* **Hệ quản trị CSDL:** **PostgreSQL 16**.
  * Quản lý quan hệ chặt chẽ: Categories, Posts, Stores, Offers, Menus, Pages, Users, Roles, Permissions.
  * Kiểu dữ liệu `JSONB` lưu ma trận phân quyền và mã khôi phục 2FA.
  * Đánh chỉ mục Index tối ưu (B-Tree + GIN) cho tìm kiếm Store (>3,700 stores) và Bài viết với tốc độ mili-giây.
* **Quản lý Phiên bản CSDL (Database Migration):** **Liquibase**.
  * Tích hợp `liquibase-core` trong Spring Boot.
  * Mọi thay đổi bảng, cột, khóa ngoại đều được viết qua các tệp changelog (`db/changelog/db.changelog-master.yaml` hoặc XML/SQL).
  * Tự động chạy migration khi khởi động app: tạo bảng tự động, không lỗi xung đột database khi deploy nhiều môi trường.
  * Tự động chèn dữ liệu ban đầu (Seed Data): 2 Role mặc định (`Admin` và `Nhân viên`), danh mục toàn bộ quyền hạn (Permissions Catalog), tài khoản Admin khởi tạo.
* **Ghi chú về Cache:** **Chưa cần dùng Redis** trong giai đoạn này để tiết kiệm tối đa RAM và tài nguyên VPS. PostgreSQL 16 kết hợp chỉ mục Index chuẩn và bộ đệm In-Memory có sẵn của Spring Boot là đủ sức chịu tải mượt mà.

---

### 2.4. LƯU TRỮ TỆP TIN (STORAGE RESOURCE)
* **Phương án:** **Lưu trực tiếp trên ổ cứng VPS (Local Disk Storage)** kết hợp **Cloudflare Free CDN**.
* **Đường dẫn vật lý:** `/var/www/bargorya/uploads/` (chia các thư mục `stores/`, `posts/`, `banners/`).
* **Phục vụ tệp tin:** **Nginx** phục vụ tĩnh trực tiếp với cấu hình `expires 30d` và `Cache-Control: public, immutable` (Spring Boot chỉ làm nhiệm vụ ghi file vào đĩa).
* **Cloudflare CDN:** Bật proxy miễn phí để lưu cache ảnh toàn cầu, tải siêu nhanh cho khách từ Social mà không tốn băng thông server.
* **Code Design:** Dùng interface `StorageService` trừu tượng (chạy `LocalStorageServiceImpl`), sẵn sàng mở rộng sang S3/R2 sau này nếu muốn.

---

### 2.5. CI/CD: GITHUB ACTIONS (Tự động hóa Kiểm thử & Triển khai)
Thiết lập quy trình CI/CD hoàn chỉnh bằng **GitHub Actions** giúp tự động hóa quá trình đẩy code lên VPS:

```
[ Git Push to 'main' ]
         │
         ▼
[ GITHUB ACTIONS WORKFLOW ]
  ├── 1. Checkout Code
  ├── 2. Setup Java 21 & Node.js 20
  ├── 3. Chạy Unit Tests & Build Maven (Spring Boot)
  ├── 4. Chạy Lint & Build Next.js
  ├── 5. Build Docker Images (Backend & Frontend)
  ├── 6. Push Images lên GitHub Packages (ghcr.io)
  └── 7. SSH vào VPS -> docker compose pull && docker compose up -d
         │
         ▼
[ VPS TỰ ĐỘNG CẬP NHẬT PHIÊN BẢN MỚI ZERO-DOWNTIME ]
```

---

### 2.6. HẠ TẦNG & DEVOPS TRÊN VPS
* **Hệ điều hành:** **Ubuntu 24.04 LTS x64** hoặc **Ubuntu 22.04 LTS**.
* **Cấu hình VPS:**
  * **2 vCPU - 4GB RAM** (đủ chạy mượt khi không có Redis).
  * Khuyến nghị: **4 vCPU - 8GB RAM** để thoải mái khi có traffic lớn từ Social.
  * **Swap RAM:** Thiết lập 4GB Swap bộ nhớ ảo.
* **Đóng gói Docker Compose:**
  * `app-postgres` (PostgreSQL 16)
  * `app-backend` (Spring Boot 3x chạy Java 21)
  * `app-frontend` (Next.js phục vụ cả Client & Admin)
* **Nginx Reverse Proxy:** Điều phối domain, phục vụ ảnh tĩnh `/uploads/`, cấp và tự động gia hạn SSL Let's Encrypt miễn phí qua Certbot.

---

### 2.7. BỘ GIẢI PHÁP TỐI ƯU SEO CẤP CAO & CHUYÊN SÂU (ADVANCED TECHNICAL & ONPAGE SEO)
Nhằm đảm bảo website đạt thứ hạng cao nhất trên Google, chiếm lĩnh các vị trí nổi bật (Google Rich Snippets) và tối ưu hóa chuyển đổi:

1. **Giao thức Lập chỉ mục tức thì (IndexNow & Google Indexing Webhook):** Tự động ping bot Bing, Yandex, Google lập tức cào và index ngay khi Admin đăng/sửa bài viết hoặc coupon, không cần chờ hàng tuần.
2. **Next.js Metadata API Động & Title CTR Hacking:** Tự động sinh `title` kèm **[Tháng] [Năm]** và con số giảm giá hấp dẫn (`60% Off | Verified Today`) kích thích tỷ lệ click chuột (CTR) đạt mức tối đa.
3. **Hệ thống Cấu trúc Dữ liệu Schema Linked `@graph` JSON-LD:**
   - `AggregateRating & Review`: Hiển thị **đánh giá 5 sao vàng uy tín** trên Google SERP (tăng CTR 35-45%).
   - `FAQPage Schema`: Hiển thị câu hỏi thường gặp dạng accordion dropdown ngay trên kết quả tìm kiếm Google.
   - `HowTo Schema`: Hướng dẫn các bước nhập mã giảm giá trực quan, kích hoạt Rich Snippet dạng step-by-step.
   - `Coupon & SaleEvent & Offer`: Đánh dấu mã giảm giá để Google đưa vào mục Deals/Shopping Promotions.
   - `NewsArticle & Person`: Chuẩn bài viết báo chí đầy đủ ngày cập nhật `dateModified`, tác giả và publisher chuẩn E-E-A-T.
   - `BreadcrumbList`: Đường dẫn phân cấp chuyên nghiệp trên Google Search.
4. **Sitemap Phân tầng Tự động (`sitemap-index.xml`):** Tự động sinh `sitemap-stores.xml` (>3,700 stores), `sitemap-posts.xml`, `sitemap-categories.xml` kèm thẻ `<lastmod>` thời gian thực.
5. **Chiến lược E-E-A-T & Chống Thin-Content (Tránh Google phạt):**
   - Trang Store luôn có bài viết hướng dẫn mua sắm chất lượng 600 - 1,000 từ (*Tổng quan, Mẹo săn mã, Chính sách vận chuyển & đổi trả, FAQ*).
   - Huy hiệu kiểm định thực tế: *"Verified & Tested Deals on [Today]"* kèm tỷ lệ thành công (Success Rate) và voting của người dùng.
6. **Kiến trúc Link Affiliate An toàn & Cloaking (Affiliate Protection):**
   - Chuyển tiếp link qua endpoint `/go/[slug]` với mã `HTTP 307 Temporary Redirect` + header `X-Robots-Tag: noindex, nofollow` + thuộc tính `rel="nofollow sponsored"`.
7. **Chiến Lược Giữ Sức Mạnh Mã Hết Hạn (Expired Coupons SEO):** Mã hết hạn chuyển vào mục accordion "Expired Codes", không 404, giữ nguyên traffic từ người tìm kiếm coupon cũ.
8. **Core Web Vitals Tối Đa (LCP < 1.2s, CLS = 0, FID < 50ms):** Sử dụng `next/font`, ảnh AVIF/WebP với `next/image` có `priority` cho logo/banner.
*(Chi tiết xem toàn bộ tại tài liệu chuyên sâu: [CHIEN_LUOC_TOI_UU_SEO_CHUYEN_SAU.md](file:///Users/khoinguyen/Documents/Affilate/CHIEN_LUOC_TOI_UU_SEO_CHUYEN_SAU.md))*

---

### 2.8. TOÀN BỘ GIAO DIỆN HIỂN THỊ 100% TIẾNG ANH (100% ENGLISH UI STANDARDIZATION)
Mọi văn bản hiển thị trên giao diện người dùng (Client Portal) và trang quản trị (ProCMS Admin) đều hiển thị 100% bằng Tiếng Anh chuẩn quốc tế (`en-US`):
- **Thanh điều hướng (Navigation Menu):** `Home`, `Stores`, `Categories`, `Coupons & Deals`, `Reviews`, `Submit Coupon`, `Dashboard`, `Users`, `Roles`, `Media`, `Settings`...
- **Hành động & Nút bấm (Buttons & Actions):** `Get Code`, `Copy Code`, `Visit Store`, `Apply Filter`, `Save Changes`, `Delete`, `Cancel`, `Upload Image`, `Verify 2FA`...
- **Nhãn trạng thái (Status Badges):** `Active`, `Inactive`, `Verified Today`, `Expired`, `Staff`, `Administrator`, `Success Rate`...
- **Thông báo & Form (Toast & Form Validation):** `Store name is required`, `Coupon code copied to clipboard!`, `Changes saved successfully`, `Are you sure you want to delete this store?`...
- **SEO & Metadata:** 100% Tiếng Anh tối ưu hóa cho thị trường tìm kiếm toàn cầu (US, UK, Global).

---

## 3. BẢNG TỔNG KẾT DANH MỤC CÔNG NGHỆ CHÍNH THỨC

| Tầng hệ thống | Công nghệ lựa chọn | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Ngôn ngữ Giao diện** | **100% English (en-US)** | Toàn bộ UI Client & Admin ProCMS dùng tiếng Anh chuẩn quốc tế |
| **Frontend Client & Admin** | **Next.js 14+ (App Router, TypeScript)** | SSR/ISR cho Client (SEO/Mobile cực nhanh); CSR cho Admin ProCMS |
| **Giao diện & UI** | **TailwindCSS + Shadcn UI + CKEditor 5** | Giao diện hiện đại, responsive, soạn thảo review chuyên nghiệp |
| **Backend Framework** | **Spring Boot 3.x** | Xử lý RESTful API, tuân thủ DTO Pattern, Constructor Injection |
| **Ngôn ngữ Backend** | **Java 21 LTS** | Virtual Threads, Records, hiệu năng cao, ổn định lâu dài |
| **Bảo mật & 2FA** | **Spring Security 6 + JWT + TOTP (2FA)** | Xác thực an toàn, Google Authenticator, phân quyền động RBAC |
| **Cơ sở dữ liệu** | **PostgreSQL 16** | CSDL quan hệ chính, dữ liệu JSONB, Full-text search |
| **Database Migration** | **Liquibase** | Quản lý phiên bản CSDL bằng changelog, tự động tạo bảng & seed data |
| **Storage / Media** | **Local SSD VPS + WebP + Nginx + Cloudflare** | Lưu ảnh trực tiếp trên ổ cứng server, Nginx phục vụ tĩnh, CDN miễn phí |
| **CI/CD Pipeline** | **GitHub Actions** | Tự động build, test, đóng gói Docker và deploy lên VPS qua SSH |
| **Hạ tầng & Đóng gói** | **Ubuntu + Docker Compose + Nginx Reverse Proxy** | Môi trường cô lập, gọn gàng, bảo mật SSL HTTPS |

---
*Tài liệu này là chuẩn kỹ thuật chính thức được chốt cho dự án. Xem quy ước code chi tiết tại [QUY_UOC_CODE_CHUAN_THIET_KE.md](file:///Users/khoinguyen/Documents/Affilate/QUY_UOC_CODE_CHUAN_THIET_KE.md).*
