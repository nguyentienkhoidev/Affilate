-- liquibase formatted sql

-- changeset heygoodly:002-seed-permissions
INSERT INTO permissions (module, action, code, name, description) VALUES
('Auth', 'access', 'backend.access', 'Access Backend', 'Permission to log into ProCMS administration panel'),
('Category', 'view', 'category.view', 'View Categories', 'Permission to view category list'),
('Category', 'create', 'category.create', 'Create Category', 'Permission to add new categories'),
('Category', 'update', 'category.update', 'Update Category', 'Permission to edit categories'),
('Category', 'delete', 'category.delete', 'Delete Category', 'Permission to remove categories'),
('Post', 'view', 'post.view', 'View Posts', 'Permission to view article list'),
('Post', 'create', 'post.create', 'Create Post', 'Permission to compose new posts'),
('Post', 'update', 'post.update', 'Update Post', 'Permission to edit posts'),
('Post', 'delete', 'post.delete', 'Delete Post', 'Permission to delete posts'),
('Post', 'clone', 'post.clone', 'Clone Post', 'Permission to duplicate posts'),
('Post', 'publish', 'post.publish', 'Publish Post', 'Permission to publish posts directly to public portal'),
('Store', 'view', 'store.view', 'View Stores', 'Permission to view store list'),
('Store', 'create', 'store.create', 'Create Store', 'Permission to add new stores'),
('Store', 'update', 'store.update', 'Update Store', 'Permission to update store details'),
('Store', 'delete', 'store.delete', 'Delete Store', 'Permission to delete stores'),
('Store', 'affiliate_intel', 'store.affiliate_intel', 'Manage Affiliate Intel', 'Permission to view commissions, portal urls and accounts'),
('Store', 'ads_assign', 'store.ads_assign', 'Assign Ads Operations', 'Permission to assign ads personnel to stores'),
('Offer', 'view', 'offer.view', 'View Offers', 'Permission to view deals and coupons list'),
('Offer', 'create', 'offer.create', 'Create Offer', 'Permission to add new offers and coupon codes'),
('Offer', 'update', 'offer.update', 'Update Offer', 'Permission to edit offers and tracking urls'),
('Offer', 'delete', 'offer.delete', 'Delete Offer', 'Permission to delete offers'),
('Offer', 'verify', 'offer.verify', 'Verify Offer', 'Permission to mark offers as verified'),
('Offer', 'clone', 'offer.clone', 'Clone Offer', 'Permission to clone offers'),
('Page', 'view', 'page.view', 'View Static Pages', 'Permission to view static page list'),
('Page', 'create', 'page.create', 'Create Static Page', 'Permission to create static pages'),
('Page', 'update', 'page.update', 'Update Static Page', 'Permission to edit static pages'),
('Page', 'delete', 'page.delete', 'Delete Static Page', 'Permission to remove static pages'),
('Menu', 'manage', 'menu.manage', 'Manage Navigation Menus', 'Permission to manage navigation menus and links'),
('Feedback', 'view', 'feedback.view', 'View Feedbacks', 'Permission to view feedback from visitors'),
('Feedback', 'delete', 'feedback.delete', 'Delete Feedback', 'Permission to delete feedback messages'),
('File', 'upload', 'file.upload', 'Upload Media Files', 'Permission to upload images and files'),
('File', 'delete', 'file.delete', 'Delete Media Files', 'Permission to delete media files'),
('User', 'view', 'user.view', 'View Users', 'Permission to view system user list'),
('User', 'create', 'user.create', 'Create User', 'Permission to create new user accounts'),
('User', 'update', 'user.update', 'Update User', 'Permission to update user accounts'),
('User', 'delete', 'user.delete', 'Delete User', 'Permission to delete user accounts'),
('User', '2fa_self', 'user.2fa_self', 'Manage Own 2FA', 'Permission to enable/disable 2FA for own account'),
('User', '2fa_reset', 'user.2fa_reset', 'Reset User 2FA', 'Permission to reset 2FA on other user accounts'),
('Role', 'view', 'role.view', 'View Roles', 'Permission to view roles and permission matrix'),
('Role', 'create', 'role.create', 'Create Role', 'Permission to create custom roles'),
('Role', 'update', 'role.update', 'Update Role', 'Permission to edit role permissions'),
('Role', 'delete', 'role.delete', 'Delete Role', 'Permission to delete custom roles'),
('Setting', 'general', 'setting.general', 'General Settings', 'Permission to configure general site identity'),
('Setting', 'seo', 'setting.seo', 'SEO Settings', 'Permission to configure SEO metadata and verification tags'),
('Setting', 'tracking', 'setting.tracking', 'Tracking Scripts', 'Permission to embed GTAG, GTM and analytics scripts'),
('Setting', 'social', 'setting.social', 'Social Settings', 'Permission to configure social media links and card images'),
('Setting', 'ads', 'setting.ads', 'Ads Banners', 'Permission to configure advertising slots and banners')
ON CONFLICT (code) DO NOTHING;

-- changeset heygoodly:003-seed-roles
INSERT INTO roles (name, slug, description, is_system) VALUES
('Administrator', 'admin', 'Super administrator with full system privileges', true),
('Staff', 'staff', 'Default operational staff role for content and deals management', true)
ON CONFLICT (slug) DO NOTHING;

-- Assign all permissions to Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.slug = 'admin'
ON CONFLICT DO NOTHING;

-- Assign standard permissions to Staff
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.slug = 'staff' AND p.code IN (
    'backend.access',
    'category.view',
    'post.view', 'post.create', 'post.update', 'post.clone', 'post.publish',
    'store.view', 'store.create', 'store.update',
    'offer.view', 'offer.create', 'offer.update', 'offer.verify', 'offer.clone',
    'file.upload',
    'user.2fa_self'
)
ON CONFLICT DO NOTHING;

-- changeset heygoodly:004-seed-admin-user
-- Default password: Admin@123456 (BCrypt: $2a$10$iHBI1Z3Ct6bAfg7J0F7MReNPPg9Y5R.z9TTaAElmi40ck2EclOCzm)
INSERT INTO users (role_id, full_name, email, password_hash, is_super_admin, is_active, created_by)
SELECT r.id, 'System Administrator', 'admin@heygoodly.com', '$2a$10$iHBI1Z3Ct6bAfg7J0F7MReNPPg9Y5R.z9TTaAElmi40ck2EclOCzm', true, true, 'system'
FROM roles r WHERE r.slug = 'admin'
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Seed Sarah Jenkins editor with 2FA enabled (Password: HeyGoodly@2026)
INSERT INTO users (role_id, full_name, email, password_hash, is_super_admin, is_active, two_factor_enabled, two_factor_secret, two_factor_recovery_codes, created_by)
SELECT r.id, 'Sarah Jenkins', 'sarah@heygoodly.com', '$2a$10$Dk3xoedHPEx4FhEjKpwv0OxOQoXWKDBz3d.DSw7hUWm7aAnx7nmMW', false, true, true, 'JBSWY3DPEHPK3PXP', '["8A41-92F0","B234-C567","D890-E123","F456-A789"]'::jsonb, 'system'
FROM roles r WHERE r.slug = 'staff'
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, two_factor_enabled = true, two_factor_secret = 'JBSWY3DPEHPK3PXP';

-- changeset heygoodly:005-seed-system-settings
INSERT INTO system_settings (setting_key, setting_value, category) VALUES
('site_name', 'HeyGoodly', 'general'),
('site_slogan', 'Smart News & Hot Deals - Save More Daily', 'general'),
('no_index', 'false', 'general'),
('search_store_enabled', 'true', 'general'),
('footer_copyright', '© 2026 HeyGoodly. All rights reserved.', 'general'),
('meta_title', 'HeyGoodly - Latest Deals, Verified Coupons & Shopping Reviews 2026', 'general'),
('meta_description', 'Discover verified promo codes, discounts, exclusive deals, and honest shopping reviews to save more every day.', 'general'),
('two_factor_issuer', 'HeyGoodlyProCMS', 'security'),
('two_factor_window_size', '3', 'security'),
('two_factor_dev_bypass_enabled', 'true', 'security'),
('two_factor_dev_otp', '884219', 'security'),
('two_factor_dev_recovery_code', '8A41-92F0', 'security'),
('auth_max_failed_attempts', '5', 'security'),
('auth_lockout_seconds', '30', 'security')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, category = EXCLUDED.category;
