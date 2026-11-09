-- liquibase formatted sql

-- ============================================================================
-- 1. ROLES, PERMISSIONS & RBAC MATRIX
-- ============================================================================
-- changeset heygoodly:001-create-roles-and-permissions-tables
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_slug ON roles(slug);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- 2. USERS, 2FA SECURITY & LOGIN AUDIT
-- ============================================================================
-- changeset heygoodly:002-create-users-and-login-records
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar VARCHAR(500),
    department VARCHAR(150),
    timezone VARCHAR(100) DEFAULT 'America/New_York (EST / UTC-5)',
    bio TEXT,
    social_x VARCHAR(255),
    social_linkedin VARCHAR(255),
    is_super_admin BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret VARCHAR(255),
    two_factor_backup_codes JSONB,
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(50),
    login_count INT NOT NULL DEFAULT 0,
    password_updated_at TIMESTAMPTZ DEFAULT NOW(),
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE TABLE IF NOT EXISTS user_login_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(50) NOT NULL,
    location VARCHAR(150),
    device VARCHAR(255),
    auth_method VARCHAR(50) NOT NULL DEFAULT 'Password', -- 'Password', '2FA (TOTP)', '2FA (Backup Code)'
    status VARCHAR(50) NOT NULL DEFAULT 'Success',        -- 'Success', 'Failed'
    duration VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_login_records_user ON user_login_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_records_created ON user_login_records(created_at DESC);

-- ============================================================================
-- 3. EDITORIAL CATEGORIES TAXONOMY
-- ============================================================================
-- changeset heygoodly:003-create-categories-table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'post', -- 'post', 'store', 'general'
    description TEXT,
    image VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 9999,
    is_active BOOLEAN NOT NULL DEFAULT true,
    show_on_home BOOLEAN NOT NULL DEFAULT false,
    show_on_nav BOOLEAN NOT NULL DEFAULT true,
    meta_title VARCHAR(255),
    meta_keywords VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order ASC);

-- ============================================================================
-- 4. MERCHANT STORES & BRAND PARTNERSHIPS
-- ============================================================================
-- changeset heygoodly:004-create-stores-table
CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    logo VARCHAR(500),
    social_card_image VARCHAR(500),
    social_title VARCHAR(255),
    social_description VARCHAR(500),
    about_store TEXT,
    max_offer INT NOT NULL DEFAULT 50,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_searchable BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 9999,
    rating_score NUMERIC(3,2) NOT NULL DEFAULT 5.00,
    rating_count INT NOT NULL DEFAULT 0,
    af_website VARCHAR(500),
    af_status VARCHAR(50) DEFAULT 'unregistered',
    af_visit_count BIGINT NOT NULL DEFAULT 0,
    af_portal_url VARCHAR(500),
    af_account VARCHAR(150),
    af_commission VARCHAR(100),
    internal_note TEXT,
    ads_status VARCHAR(50) DEFAULT 'none',
    ads_account VARCHAR(100),
    meta_title VARCHAR(255),
    meta_keywords VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_category_id ON stores(category_id);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(is_active);
CREATE INDEX IF NOT EXISTS idx_stores_clicks ON stores(af_visit_count DESC);

-- ============================================================================
-- 5. OFFERS, COUPONS & VOUCHERS
-- ============================================================================
-- changeset heygoodly:005-create-offers-table
CREATE TABLE IF NOT EXISTS offers (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    discount_value VARCHAR(100) NOT NULL,
    code VARCHAR(100),
    url_ref TEXT NOT NULL,
    description TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 9999,
    expire_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_offers_store_id ON offers(store_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_code ON offers(code);
CREATE INDEX IF NOT EXISTS idx_offers_sort ON offers(sort_order ASC, created_at DESC);

-- ============================================================================
-- 6. EDITORIAL ARTICLES, LAB REVIEWS & BUYING GUIDES
-- ============================================================================
-- changeset heygoodly:006-create-posts-table
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL, -- Link article directly to associated merchant store
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,                                    -- Rich HTML/Markdown content
    image VARCHAR(500),
    read_time VARCHAR(50) DEFAULT '5 min read',
    rating NUMERIC(3,2) DEFAULT 4.80,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',          -- 'PUBLISHED', 'SCHEDULED', 'DRAFT'
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 9999,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_at TIMESTAMPTZ,                                 -- Future publish time for cron publisher
    view_count BIGINT NOT NULL DEFAULT 0,
    tags JSONB,                                               -- String array of tags, e.g. ["Tech", "Reviews", "GaN"]
    sidebar_config JSONB,                                     -- Dynamic sidebar layout {showBrandCard, showStoreCoupons, showGuaranteeCard, ctaText...}
    meta_title VARCHAR(255),
    meta_keywords VARCHAR(255),
    meta_description TEXT,
    canonical_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_store_id ON posts(store_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);

-- ============================================================================
-- 7. NAVIGATION MENUS (HEADER & FOOTER)
-- ============================================================================
-- changeset heygoodly:007-create-menus-table
CREATE TABLE IF NOT EXISTS menus (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES menus(id) ON DELETE CASCADE,
    position VARCHAR(50) NOT NULL DEFAULT 'main', -- 'main' (header navigation) | 'footer' (sitemap links)
    title VARCHAR(150) NOT NULL,
    target_type VARCHAR(50) NOT NULL DEFAULT 'url', -- 'url', 'category', 'store', 'page'
    target_value VARCHAR(500) NOT NULL,             -- URL path or slug
    image_icon VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 9999,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_position ON menus(position);
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order ASC);

-- ============================================================================
-- 8. STATIC POLICY & COMPLIANCE PAGES
-- ============================================================================
-- changeset heygoodly:008-create-pages-table
CREATE TABLE IF NOT EXISTS pages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    image VARCHAR(500),
    content TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 9999,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_active ON pages(is_active);

-- ============================================================================
-- 9. CUSTOMER INQUIRIES & FEEDBACK
-- ============================================================================
-- changeset heygoodly:009-create-feedbacks-table
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'coupon_report', 'partnership'
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    reply_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_read ON feedbacks(is_read);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks(created_at DESC);

-- ============================================================================
-- 10. SYSTEM SETTINGS & TELEMETRY
-- ============================================================================
-- changeset heygoodly:010-create-system-settings-table
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    category VARCHAR(50) DEFAULT 'general', -- 'general', 'seo', 'tracking', 'ads', 'newsletter'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- ============================================================================
-- 11. MEDIA LIBRARY (MINIO OBJECT STORAGE METADATA)
-- ============================================================================
-- changeset heygoodly:011-create-media-items-table
CREATE TABLE IF NOT EXISTS media_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    object_key VARCHAR(500) NOT NULL UNIQUE,        -- MinIO S3 object key (e.g. 'articles/2026/img-401.webp')
    bucket VARCHAR(100) NOT NULL DEFAULT 'heygoodly-media',
    url VARCHAR(500) NOT NULL,                      -- Public CDN / MinIO URL
    category VARCHAR(50) NOT NULL DEFAULT 'articles',-- 'articles', 'stores', 'banners', 'avatars'
    size_bytes BIGINT,
    mime_type VARCHAR(100),
    dimensions VARCHAR(50),                         -- e.g. '1200x800' or 'Optimized'
    tags JSONB,                                     -- Array of tag strings ['tech', 'keyboard']
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_items_category ON media_items(category);
CREATE INDEX IF NOT EXISTS idx_media_items_created ON media_items(created_at DESC);

-- ============================================================================
-- 12. NEWSLETTER SUBSCRIBERS
-- ============================================================================
-- changeset heygoodly:012-create-subscribers-table
CREATE TABLE IF NOT EXISTS subscribers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'unsubscribed', 'banned'
    source VARCHAR(100) DEFAULT 'homepage_footer',
    ip_address VARCHAR(50),
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);

-- ============================================================================
-- 13. OUTBOUND AFFILIATE REDIRECT CLICKS (ANALYTICS & CONVERSIONS)
-- ============================================================================
-- changeset heygoodly:013-create-affiliate-clicks-table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id BIGSERIAL PRIMARY KEY,
    click_code VARCHAR(64) NOT NULL UNIQUE,       -- Short UUID / token used in /out/{click_code} or /go/{slug}
    store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,
    offer_id BIGINT REFERENCES offers(id) ON DELETE SET NULL,
    target_url TEXT NOT NULL,
    user_ip VARCHAR(50),
    user_agent TEXT,
    referer_url TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON affiliate_clicks(click_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_store ON affiliate_clicks(store_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_offer ON affiliate_clicks(offer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created ON affiliate_clicks(created_at DESC);

-- ============================================================================
-- 14. PROCMS AUDIT LOGS & ACTION TRACING
-- ============================================================================
-- changeset heygoodly:014-create-audit-logs-table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(150),
    action VARCHAR(50) NOT NULL,   -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', '2FA_VERIFY', 'SECURITY_LOCKDOWN'
    module VARCHAR(50) NOT NULL,   -- 'articles', 'stores', 'offers', 'categories', 'users', 'roles', 'settings'
    resource_id VARCHAR(100),
    resource_name VARCHAR(255),
    ip_address VARCHAR(50),
    device VARCHAR(255),
    changes JSONB,                 -- Diff object: {"before": {...}, "after": {...}}
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'WARNING'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
