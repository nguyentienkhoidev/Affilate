-- liquibase formatted sql

-- changeset heygoodly:013-update-audit-logs-ip-device splitStatements:true endDelimiter:;
UPDATE audit_logs 
SET ip_address = '127.0.0.1', 
    device = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
WHERE ip_address = 'unknown' OR ip_address IS NULL;

