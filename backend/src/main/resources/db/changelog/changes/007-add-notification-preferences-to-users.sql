-- liquibase formatted sql

-- changeset heygoodly:007-add-notification-preferences-to-users splitStatements:true endDelimiter:;

-- 1. Add notification_preferences column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"securityLogins": true, "twoFaChanges": true, "commissionSpikes": true, "couponExpirations": true, "customerFeedback": true, "browserPush": false}'::jsonb;

-- 2. Update default admin profile information
UPDATE users 
SET 
    department = COALESCE(department, 'Core Operations & Affiliate Strategy'),
    timezone = COALESCE(timezone, 'UTC+07:00 (Bangkok, Hanoi, Jakarta)'),
    bio = COALESCE(bio, 'Senior editor and technical administrator overseeing HeyGoodly affiliate pipelines, verified deal indexing, and laboratory benchmark integrity.'),
    social_x = COALESCE(social_x, 'https://x.com/heygoodly_admin'),
    social_linkedin = COALESCE(social_linkedin, 'https://linkedin.com/in/heygoodly'),
    phone = COALESCE(phone, '+1 (800) 555-0199'),
    avatar = COALESCE(avatar, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')
WHERE email = 'admin@heygoodly.com';

-- 3. Seed demo login records / active sessions for admin
INSERT INTO user_login_records (user_id, ip_address, location, device, auth_method, status, duration, created_at)
SELECT 
    id,
    '127.0.0.1 (Localhost)',
    'Hanoi, Vietnam',
    'MacBook Pro 16" (Apple M3 Max) / Google Chrome 130.0',
    'Password + 2FA',
    'Success',
    'Active Now',
    NOW() - INTERVAL '5 minutes'
FROM users WHERE email = 'admin@heygoodly.com'
LIMIT 1;

INSERT INTO user_login_records (user_id, ip_address, location, device, auth_method, status, duration, created_at)
SELECT 
    id,
    '113.190.234.12',
    'Hanoi, Vietnam',
    'iPhone 15 Pro Max / Mobile Safari 17.5',
    'Password + 2FA',
    'Success',
    '3 hours ago',
    NOW() - INTERVAL '3 hours'
FROM users WHERE email = 'admin@heygoodly.com'
LIMIT 1;

INSERT INTO user_login_records (user_id, ip_address, location, device, auth_method, status, duration, created_at)
SELECT 
    id,
    '42.119.145.88',
    'Da Nang, Vietnam',
    'Dell XPS 15 Workstation / Firefox Developer 128.0',
    'Password',
    'Success',
    '2 days ago',
    NOW() - INTERVAL '2 days'
FROM users WHERE email = 'admin@heygoodly.com'
LIMIT 1;
