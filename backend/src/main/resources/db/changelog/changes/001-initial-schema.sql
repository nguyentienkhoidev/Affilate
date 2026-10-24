-- liquibase formatted sql

-- changeset bargorya:001-create-categories-table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'post',
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    image VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    show_on_home BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 9999,
    description TEXT,
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

-- changeset bargorya:002-create-roles-and-permissions-tables
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

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- changeset bargorya:003-create-users-table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar VARCHAR(500),
    is_super_admin BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret VARCHAR(255),
    two_factor_recovery_codes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- changeset bargorya:004-create-stores-table
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
    af_status VARCHAR(50) NOT NULL DEFAULT 'unregistered',
    af_network VARCHAR(100),
    af_visit_count BIGINT NOT NULL DEFAULT 0,
    af_portal_url VARCHAR(500),
    af_account VARCHAR(150),
    af_commission VARCHAR(100),
    internal_note TEXT,
    ads_status VARCHAR(50) NOT NULL DEFAULT 'none',
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
CREATE INDEX IF NOT EXISTS idx_stores_searchable ON stores(is_searchable);
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);

-- changeset bargorya:005-create-offers-table
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

-- changeset bargorya:006-create-posts-table
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image VARCHAR(500),
    excerpt TEXT,
    content TEXT NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 9999,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    view_count BIGINT NOT NULL DEFAULT 0,
    meta_title VARCHAR(255),
    meta_keywords VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_active ON posts(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured);

-- changeset bargorya:007-create-menus-table
CREATE TABLE IF NOT EXISTS menus (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES menus(id) ON DELETE CASCADE,
    position VARCHAR(50) NOT NULL DEFAULT 'main',
    title VARCHAR(150) NOT NULL,
    target_type VARCHAR(50) NOT NULL DEFAULT 'url',
    target_value VARCHAR(500) NOT NULL,
    image_icon VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 9999,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_position ON menus(position);
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);

-- changeset bargorya:008-create-pages-table
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

-- changeset bargorya:009-create-feedbacks-table
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- changeset bargorya:010-create-system-settings-table
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
