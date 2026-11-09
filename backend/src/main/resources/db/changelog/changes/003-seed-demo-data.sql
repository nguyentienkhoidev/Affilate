-- liquibase formatted sql

-- changeset heygoodly:003-seed-demo-data splitStatements:true endDelimiter:;
-- Seed Initial Categories
INSERT INTO categories (name, slug, description, sort_order, is_active, created_at, updated_at)
VALUES 
('Automotive & Accessories', 'automotive-accessories', 'Top verified coupons and discount promo codes for car lights, auto parts, and vehicle accessories.', 1, true, NOW(), NOW()),
('Electronics & Gadgets', 'electronics-gadgets', 'Save on power banks, chargers, audio gear, smart home equipment, and consumer electronics.', 2, true, NOW(), NOW()),
('Gaming & Collectibles', 'gaming-collectibles', 'Exclusive discounts on custom dueling lightsabers, gaming peripherals, and collector gear.', 3, true, NOW(), NOW()),
('Home & Garden', 'home-garden', 'Discount codes for home improvement, tools, indoor lighting, and garden appliances.', 4, true, NOW(), NOW()),
('Hosting & Software', 'hosting-software', 'Verified coupons for web hosting, cloud servers, VPNs, and productivity software tools.', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Seed Demo Stores
INSERT INTO stores (name, slug, logo, rating_score, rating_count, about_store, af_website, is_active, is_searchable, meta_title, meta_description, created_at, updated_at)
VALUES 
(
  'Nilight',
  'nilight',
  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&auto=format&fit=crop&q=80',
  4.85,
  1420,
  'Nilight is a renowned manufacturer specializing in automotive lighting, high-performance LED light bars, wiring harnesses, and rugged off-road accessories. Founded with a mission to illuminate paths safely and reliably, Nilight delivers durable automotive upgrades backed by comprehensive warranties.',
  'https://www.nilight.com/?pb_ref=heygoodly',
  true,
  true,
  'Nilight Coupon Codes & Verified Deals - Up to 40% Off 2026',
  'Find the latest verified Nilight coupon codes, promo deals, and exclusive discount vouchers. Save on LED light bars and automotive accessories today.',
  NOW(),
  NOW()
),
(
  'Neo Sabers',
  'neo-sabers',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
  4.92,
  980,
  'Neo Sabers is the premier destination for battle-ready custom dueling lightsabers, Xenopixel soundboards, and high-end collector hilts engineered for dueling tournaments and Star Wars enthusiasts worldwide.',
  'https://neosabers.com/?ref=heygoodly',
  true,
  true,
  'Neo Sabers Promo Codes & Lightsaber Discounts - 2026',
  'Get active Neo Sabers coupons and coupon codes. Enjoy up to $100 off premium Neopixel dueling lightsabers and accessories.',
  NOW(),
  NOW()
),
(
  'Auxito',
  'auxito',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300&auto=format&fit=crop&q=80',
  4.78,
  1150,
  'Auxito delivers ultra-bright, canbus-ready LED headlight replacement bulbs, fog lights, and interior lighting kits designed for seamless plug-and-play installation across all major vehicle models.',
  'https://auxito.com/?impact_ref=heygoodly',
  true,
  true,
  'Auxito Coupon Codes - Verified 20% Off Car LED Bulbs 2026',
  'Upgrade your automotive headlights with active Auxito promo codes. Guaranteed verified discount coupons and free delivery offers.',
  NOW(),
  NOW()
),
(
  'Anker',
  'anker',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&auto=format&fit=crop&q=80',
  4.90,
  3540,
  'Anker is a global leader in charging technology and portable power stations, renowned for pioneering GaNPrime chargers, ultra-durable PowerCore batteries, and smart lifestyle accessories.',
  'https://www.anker.com/?cj_ref=heygoodly',
  true,
  true,
  'Anker Promo Codes & Discounts - Up to 45% Off Power Banks 2026',
  'Discover tested Anker coupon codes for fast GaN chargers, USB-C cables, and portable solar power stations.',
  NOW(),
  NOW()
),
(
  'Hostinger',
  'hostinger',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80',
  4.82,
  2410,
  'Hostinger provides fast, secure, and affordable cloud and WordPress web hosting with 99.9% uptime, free SSL certificates, and intuitive hPanel management for developers and site owners.',
  'https://www.hostinger.com/?impact_ref=heygoodly',
  true,
  true,
  'Hostinger Coupon Codes - 80% Off Web Hosting + Free Domain 2026',
  'Save up to 80% on Hostinger cloud and WordPress hosting with verified coupon codes. Includes free domain and SSL certificate.',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Demo Offers for Nilight
INSERT INTO offers (store_id, name, code, discount_value, url_ref, is_verified, is_active, sort_order, description, created_at, updated_at)
SELECT 
  s.id,
  '15% Off Sitewide On All LED Lights & Bars',
  'NILIGHT15',
  '15% OFF',
  'https://www.nilight.com/?pb_ref=heygoodly',
  true,
  true,
  1,
  'Valid on all standard items. Excludes clearance items. Cannot be combined with other promotional offers.',
  NOW(),
  NOW()
FROM stores s WHERE s.slug = 'nilight'
LIMIT 1;

INSERT INTO offers (store_id, name, code, discount_value, url_ref, is_verified, is_active, sort_order, description, created_at, updated_at)
SELECT 
  s.id,
  '$25 Off Orders Over $150',
  'SAVE25OFF',
  '$25 OFF',
  'https://www.nilight.com/?pb_ref=heygoodly',
  true,
  true,
  2,
  'Minimum cart subtotal of $150 required. Applies automatically at checkout with code.',
  NOW(),
  NOW()
FROM stores s WHERE s.slug = 'nilight'
LIMIT 1;

INSERT INTO offers (store_id, name, code, discount_value, url_ref, is_verified, is_active, sort_order, description, created_at, updated_at)
SELECT 
  s.id,
  'Up to 40% Off Nilight Heavy Duty Clearance',
  NULL,
  'Up to 40% OFF',
  'https://www.nilight.com/collections/clearance?pb_ref=heygoodly',
  true,
  true,
  3,
  'Discount already reflected in prices on product landing pages. Limited stock available.',
  NOW(),
  NOW()
FROM stores s WHERE s.slug = 'nilight'
LIMIT 1;

-- Seed Demo Offers for Neo Sabers
INSERT INTO offers (store_id, name, code, discount_value, url_ref, is_verified, is_active, sort_order, description, created_at, updated_at)
SELECT 
  s.id,
  '$50 Off Custom Xenopixel Lightsabers',
  'FORCE50',
  '$50 OFF',
  'https://neosabers.com/?ref=heygoodly',
  true,
  true,
  1,
  'Applies to all Xenopixel and Proffie hilt models. Free blade plug included.',
  NOW(),
  NOW()
FROM stores s WHERE s.slug = 'neo-sabers'
LIMIT 1;

-- Seed Demo Offers for Auxito
INSERT INTO offers (store_id, name, code, discount_value, url_ref, is_verified, is_active, sort_order, description, created_at, updated_at)
SELECT 
  s.id,
  '20% Off All Canbus LED Headlight Bulbs',
  'AUX20LIGHT',
  '20% OFF',
  'https://auxito.com/?impact_ref=heygoodly',
  true,
  true,
  1,
  'Works on all 9005, H11, and H7 high-power LED series. Free shipping on orders over $49.',
  NOW(),
  NOW()
FROM stores s WHERE s.slug = 'auxito'
LIMIT 1;

-- Seed Demo Static Pages
INSERT INTO pages (title, slug, content, is_active, sort_order, meta_title, meta_description, created_at, updated_at)
VALUES 
(
  'About Us',
  'about-us',
  '<h2>Welcome to HeyGoodly - The Premier Shopping & Savings Destination</h2><p>HeyGoodly was built with a single focused goal: ensuring shoppers never pay full retail price online again. Founded by veteran e-commerce and affiliate specialists, our platform bridges consumers with trusted direct-to-consumer (DTC) brands across the globe.</p><h3>Our Verification Standards</h3><p>Unlike generic coupon scrapers, our editorial team personally hand-tests each coupon code on live merchant shopping carts every single day. If a code fails to discount an order, we immediately remove or flag it.</p>',
  true,
  1,
  'About HeyGoodly - Trusted Deals, Coupons & Editorial Reviews',
  'Learn about HeyGoodly mission, our expert coupon verification process, and how we help millions of online shoppers save money safely.',
  NOW(),
  NOW()
),
(
  'Affiliate Disclosure',
  'affiliate-disclosure',
  '<h2>Affiliate Disclosure & Transparency Policy</h2><p>In compliance with Federal Trade Commission (FTC) guidelines, HeyGoodly maintains full transparency regarding our merchant partnerships. When you click through our affiliate links (such as /go/ or /out/) and complete a purchase, we may earn an affiliate commission at no additional cost to you.</p><p>This compensation supports our editorial team and website maintenance. Our reviews and rankings remain strictly objective and unbiased.</p>',
  true,
  2,
  'Affiliate Disclosure - HeyGoodly Transparency & FTC Compliance',
  'Read the HeyGoodly FTC affiliate disclosure policy explaining affiliate tracking links, commissions, and editorial independence.',
  NOW(),
  NOW()
),
(
  'Privacy Policy',
  'privacy-policy',
  '<h2>Privacy Policy</h2><p>At HeyGoodly, accessible from https://heygoodly.com, the privacy of our visitors is of paramount importance. This Privacy Policy documents the types of information collected and how we use it in accordance with GDPR and CCPA regulations.</p><p>We do not sell personal data. Information collected via server logs and cookies is utilized strictly to analyze trends, administer the site, and track outbound affiliate referrals.</p>',
  true,
  3,
  'Privacy Policy - HeyGoodly',
  'HeyGoodly Privacy Policy regarding cookies, user data protection, and compliance with GDPR and CCPA regulations.',
  NOW(),
  NOW()
),
(
  'Terms of Service',
  'terms',
  '<h2>Terms of Service</h2><p>By accessing the HeyGoodly website, you agree to abide by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p><p>Coupon codes and discount promotions provided on HeyGoodly are subject to merchant terms and may expire without prior notice.</p>',
  true,
  4,
  'Terms of Service - HeyGoodly',
  'Review the terms of service governing usage of the HeyGoodly website and discount coupon services.',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Navigation Menus
INSERT INTO menus (position, title, target_type, target_value, sort_order, is_active, created_at, updated_at)
VALUES 
('main', 'Stores', 'url', '/stores', 1, true, NOW(), NOW()),
('main', 'Categories', 'url', '/categories', 2, true, NOW(), NOW()),
('main', 'Editor Picks', 'url', '/posts', 3, true, NOW(), NOW()),
('main', 'About Us', 'page', '/about-us', 4, true, NOW(), NOW()),
('main', 'Contact', 'url', '/contact-us', 5, true, NOW(), NOW()),

('footer', 'All Stores', 'url', '/stores', 1, true, NOW(), NOW()),
('footer', 'Categories', 'url', '/categories', 2, true, NOW(), NOW()),
('footer', 'About Us', 'page', '/about-us', 3, true, NOW(), NOW()),
('footer', 'Affiliate Disclosure', 'page', '/affiliate-disclosure', 4, true, NOW(), NOW()),
('footer', 'Privacy Policy', 'page', '/privacy-policy', 5, true, NOW(), NOW()),
('footer', 'Terms of Service', 'page', '/terms', 6, true, NOW(), NOW()),
('footer', 'Contact Us', 'url', '/contact-us', 7, true, NOW(), NOW());

-- Seed Demo Editorial Review Posts
INSERT INTO posts (
    title, slug, excerpt, content, image, read_time, rating, status,
    is_featured, is_active, view_count, store_id, category_id,
    tags, meta_title, meta_description, created_at, updated_at
)
SELECT 
    'Nilight LED Light Bar Comprehensive Review: In-Depth Field Testing & Durability Analysis',
    'nilight-led-light-bar-review',
    'We put Nilights flagship triple-row LED light bars through extreme heat, submersion, and vibration tests to evaluate whether they deliver on their high-lumen promises.',
    '<h2>Introduction to Nilight Off-Road Optics</h2><p>For off-road adventurers, adequate lighting is not merely a convenience—it is a critical safety component. Nilight has earned a reputation as the top-selling budget-to-midrange lighting powerhouse on e-commerce platforms.</p><h3>Build Quality and Thermal Dissipation</h3><p>Crafted from die-cast 6063 aluminum alloy and sealed with silicone gaskets rated to IP67/IP68 water resistance, these housings withstand intense pressure washer spray and prolonged submersions without fogging.</p><h3>Our Verdict & Value Analysis</h3><p>If you need dependable off-road performance without the astronomical price tag of commercial boutique bars, Nilight is an unbeatable recommendation.</p>',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&auto=format&fit=crop&q=80',
    '6 min read',
    4.90,
    'PUBLISHED',
    true,
    true,
    18420,
    s.id,
    c.id,
    '["Off-Road", "Automotive", "LED Lights", "Tested"]'::jsonb,
    'Nilight LED Light Bar Review 2026 - Tested & Verified Performance',
    'In-depth review and durability torture test of Nilight LED Light Bars for trucks, SUVs, and off-road builds.',
    NOW(),
    NOW()
FROM stores s, categories c 
WHERE s.slug = 'nilight' AND c.slug = 'automotive-accessories'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO posts (
    title, slug, excerpt, content, image, read_time, rating, status,
    is_featured, is_active, view_count, store_id, category_id,
    tags, meta_title, meta_description, created_at, updated_at
)
SELECT 
    'Neo Sabers Xenopixel V3 In-Depth Review: Battle-Ready Performance vs Collector Hilts',
    'neo-sabers-xenopixel-review',
    'An exhaustive breakdown of smooth swing algorithms, blade illumination brightness, sound font fidelity, and hilt ergonomics.',
    '<h2>Engineering the Ultimate Dueling Saber</h2><p>Neo Sabers has established itself as an innovative force in the custom saber community, bridging high-end electronics with heavy-grade polycarbonate blades suited for full-contact dueling.</p><h3>Soundboard & Gesture Controls</h3><p>With intuitive twist-on motion triggers and responsive tip-drag lighting effects, the Xenopixel soundboard gives fans an authentic cinematic experience right out of the box.</p>',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
    '8 min read',
    4.95,
    'PUBLISHED',
    true,
    false,
    12850,
    s.id,
    c.id,
    '["Lightsaber", "Collectibles", "Star Wars", "Xenopixel"]'::jsonb,
    'Neo Sabers Review: Xenopixel Lightsabers Tested - HeyGoodly',
    'Read our hands-on review of Neo Sabers custom lightsabers covering durability, sound fonts, and pricing.',
    NOW(),
    NOW()
FROM stores s, categories c 
WHERE s.slug = 'neo-sabers' AND c.slug = 'gaming-collectibles'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;
