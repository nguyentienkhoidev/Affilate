-- liquibase formatted sql

-- changeset heygoodly:012-seed-affiliate-clicks-telemetry splitStatements:false
DO $$
DECLARE
    store_record RECORD;
    offer_id_val BIGINT;
    days_back INT;
    clicks_count INT;
    i INT;
    target_date TIMESTAMPTZ;
    sample_ip VARCHAR(50);
BEGIN
    IF (SELECT COUNT(*) FROM affiliate_clicks) < 50 THEN
        FOR days_back IN 0..89 LOOP
            target_date := NOW() - (days_back || ' days')::interval;

            FOR store_record IN SELECT id, af_website FROM stores WHERE is_active = true AND is_deleted = false LIMIT 10 LOOP
                clicks_count := 6 + (days_back % 7) * 4 + ((store_record.id * 3) % 11);

                SELECT id INTO offer_id_val FROM offers WHERE store_id = store_record.id AND is_active = true AND is_deleted = false LIMIT 1;

                FOR i IN 1..clicks_count LOOP
                    sample_ip := '10.0.' || (1 + (i % 250)) || '.' || (1 + ((days_back + i) % 250));
                    INSERT INTO affiliate_clicks (
                        click_code,
                        store_id,
                        offer_id,
                        target_url,
                        user_ip,
                        user_agent,
                        referer_url,
                        utm_source,
                        utm_medium,
                        created_at
                    ) VALUES (
                        md5(random()::text || clock_timestamp()::text || days_back::text || i::text || store_record.id::text),
                        store_record.id,
                        offer_id_val,
                        COALESCE(store_record.af_website, 'https://heygoodly.com'),
                        sample_ip,
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'https://heygoodly.com/store/' || store_record.id,
                        'heygoodly_portal',
                        'referral',
                        target_date - (((i * 473) % 86400) || ' seconds')::interval
                    ) ON CONFLICT (click_code) DO NOTHING;
                END LOOP;
            END LOOP;
        END LOOP;
    END IF;
END $$;

