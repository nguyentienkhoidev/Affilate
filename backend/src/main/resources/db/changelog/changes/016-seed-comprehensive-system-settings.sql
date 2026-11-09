-- changeset heygoodly:016-seed-comprehensive-system-settings
INSERT INTO system_settings (setting_key, setting_value, category) VALUES
-- Brand & Identity
('contact_email', 'contact@heygoodly.com', 'general'),
('contact_hotline', '+1 (800) 555-0199', 'general'),
('contact_address', '100 Montgomery St, Suite 1800, San Francisco, CA 94104', 'general'),
('site_logo', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=60&fit=crop&q=80', 'general'),
('site_favicon', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=32&h=32&fit=crop&q=80', 'general'),

-- SEO & Search Verification
('google_meta', '<meta name="google-site-verification" content="google_auth_token_8892" />', 'seo'),
('bing_meta', '<meta name="msvalidate.01" content="bing_auth_token_4412" />', 'seo'),
('canonical_url', 'https://heygoodly.com', 'seo'),
('og_image', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=630&fit=crop&q=80', 'seo'),

-- Telemetry & Tracking
('gtm_id', 'GTM-BG9942A', 'telemetry'),
('gtag_id', 'G-772910842', 'telemetry'),
('facebook_pixel', '88291029481920', 'telemetry'),
('cloudflare_token', 'cf_token_9918238472910', 'telemetry'),

-- Monetization & Header Ads
('header_ads_active', 'true', 'monetization'),
('header_ads_badge', 'Partner Spotlight', 'monetization'),
('header_ads_subtitle', 'Vetted Promotion', 'monetization'),
('header_ads_title', 'Seasonal Consumer Tech & Smart Home Clearance Deals', 'monetization'),
('header_ads_description', 'Hand-tested promo codes checked against live merchant checkouts.', 'monetization'),
('header_ads_button_text', 'Discover', 'monetization'),
('header_ads_banner_url', 'https://www.anker.com/?cj_ref=heygoodly', 'monetization'),
('header_ads_banner_img', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=728&h=90&fit=crop&q=80', 'monetization'),
('affiliate_redirect_prefix', '/out/', 'monetization'),
('affiliate_amazon_tag', 'heygoodly-20', 'monetization'),
('affiliate_impact_id', 'HG_IMP_49102', 'monetization'),
('affiliate_cj_id', 'HG_CJ_881920', 'monetization'),
('affiliate_shareasale_id', 'HG_SAS_11029', 'monetization'),
('affiliate_disclosure', 'HeyGoodly is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.', 'monetization'),

-- Newsletter
('newsletter_enabled', 'true', 'newsletter'),
('newsletter_eyebrow', 'The HeyGoodly Dispatch', 'newsletter'),
('newsletter_title', 'Independent Reviews & Product Tests, Weekly', 'newsletter'),
('newsletter_description', 'Zero sponsored ranking manipulation. Join 45,000+ smart readers who rely on our independent testing laboratory.', 'newsletter'),
('newsletter_placeholder', 'Enter your email address...', 'newsletter'),
('newsletter_button_text', 'Subscribe', 'newsletter'),
('newsletter_success_message', 'Thank you for subscribing! Watch your inbox for the next Dispatch.', 'newsletter'),
('newsletter_welcome_subject', 'Welcome to HeyGoodly Dispatch - Your Tech & Deal Briefing', 'newsletter'),
('newsletter_double_optin', 'false', 'newsletter')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, category = EXCLUDED.category;

