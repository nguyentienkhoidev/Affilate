-- Liquibase formatted SQL
-- Changeset heygoodly:018-create-tags-table
CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(30) DEFAULT '#6366f1',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_is_featured ON tags(is_featured);
CREATE INDEX IF NOT EXISTS idx_tags_is_active ON tags(is_active);

-- Seed initial standard tags based on posts and media items
INSERT INTO tags (name, slug, description, color, is_featured, is_active, created_at, updated_at) VALUES
('Tech & Gadgets', 'tech', 'Technology innovations, gadgets, hardware benchmarks and electronics.', '#3b82f6', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Reviews', 'reviews', 'In-depth editorial evaluations, hands-on tests and lab ratings.', '#10b981', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Apple Ecosystem', 'apple', 'MacBooks, iPhones, iPads, Apple Silicon and macOS accessories.', '#6366f1', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Accessories', 'accessories', 'Docks, cables, chargers, cases, stands and daily carry accessories.', '#f59e0b', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Audio & Acoustics', 'audio', 'Headphones, earbuds, speakers, studio monitors and Hi-Fi equipment.', '#8b5cf6', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Automotive & EV', 'automotive', 'Car tech, electric vehicle chargers, dashcams and LED lighting.', '#ec4899', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Deals & Coupons', 'deals', 'Verified promotional discounts, coupon codes and flash sales.', '#ef4444', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Smart Home & IoT', 'smart-home', 'Home automation, smart plugs, robotic vacuums and security cams.', '#06b6d4', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Anker Innovation', 'anker', 'Fast GaN chargers, power banks, Soundcore audio and portable power.', '#0284c7', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Banners & Creative', 'banner', 'Marketing graphics, promotional display banners and creative assets.', '#f97316', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Brand Partners', 'brand', 'Official merchant collaborations, vetted retail brands and affiliates.', '#84cc16', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Lifestyle & Daily', 'lifestyle', 'Workplace ergonomics, desk setups and everyday essentials.', '#14b8a6', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

-- Seed permissions for Tag Management
INSERT INTO permissions (module, action, code, name, description) VALUES
('Tag', 'view', 'tag.view', 'View Tags', 'Permission to view tag directory'),
('Tag', 'create', 'tag.create', 'Create Tag', 'Permission to add new tags'),
('Tag', 'update', 'tag.update', 'Update Tag', 'Permission to edit tags'),
('Tag', 'delete', 'tag.delete', 'Delete Tag', 'Permission to remove tags')
ON CONFLICT (code) DO NOTHING;

-- Assign tag permissions to admin and super admin roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug IN ('super_admin', 'admin', 'editor') AND p.module = 'Tag'
ON CONFLICT DO NOTHING;

