#!/usr/bin/env python3
"""
HeyGoodly ProCMS - System Settings Automated Test Suite
Validates 100% database-driven configuration management, 
all tabs persistence in PostgreSQL, audit logging, and factory defaults reset.
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080/api/v1"
ADMIN_EMAIL = "admin@heygoodly.com"
ADMIN_PASS = "Admin@123456"

class TestSettingsRunner:
    def __init__(self):
        self.token = None
        self.passed = 0
        self.failed = 0

    def log(self, name, success, details=""):
        if success:
            self.passed += 1
            print(f"  [PASS] {name} {details}")
        else:
            self.failed += 1
            print(f"  [FAIL] {name} {details}")

    def request(self, method, endpoint, body=None, expected_status=200):
        url = f"{BASE_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(url, data=data, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req) as response:
                status = response.status
                payload = json.loads(response.read().decode("utf-8"))
                return status, payload
        except urllib.error.HTTPError as err:
            try:
                payload = json.loads(err.read().decode("utf-8"))
            except Exception:
                payload = {"error": str(err)}
            return err.code, payload
        except Exception as e:
            return 500, {"error": str(e)}

    def authenticate(self):
        print("\n--- 1. Authenticating Super Admin ---")
        status, res = self.request("POST", "/auth/login", {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASS
        })
        if status != 200 or not res.get("data"):
            print("  [ERROR] Login failed:", res)
            sys.exit(1)

        data = res["data"]
        if data.get("requiresTwoFactor"):
            temp = data["tempToken"]
            v_status, v_res = self.request("POST", "/auth/verify-2fa", {
                "tempToken": temp,
                "otpCode": 884219
            })
            if v_status != 200 or not v_res.get("data"):
                print("  [ERROR] 2FA verification failed:", v_res)
                sys.exit(1)
            self.token = v_res["data"]["accessToken"]
        else:
            self.token = data["accessToken"]

        self.log("Super Admin Authentication", bool(self.token), "(JWT Bearer Acquired)")

    def test_get_settings(self):
        print("\n--- 2. Fetch System Settings from PostgreSQL ---")
        # 1. Admin settings endpoint
        status, res = self.request("GET", "/admin/settings")
        settings = res.get("data", {}).get("settings", {})
        self.log("Fetch Admin Settings (GET /api/v1/admin/settings)",
                 status == 200 and len(settings) >= 40,
                 f"({len(settings)} parameters loaded from DB)")

        # Verify key baseline parameters
        has_brand = "site_name" in settings and "site_slogan" in settings
        has_seo = "meta_title" in settings and "google_meta" in settings
        has_telemetry = "gtm_id" in settings and "gtag_id" in settings
        has_ads = "header_ads_banner_url" in settings and "header_ads_title" in settings
        has_newsletter = "newsletter_enabled" in settings and "newsletter_title" in settings
        has_security = "two_factor_issuer" in settings and "auth_max_failed_attempts" in settings

        self.log("Verify Brand & SEO Parameters", has_brand and has_seo)
        self.log("Verify Telemetry & Monetization Parameters", has_telemetry and has_ads)
        self.log("Verify Newsletter & Security Policies Parameters", has_newsletter and has_security)

        # 2. Public settings endpoint
        p_status, p_res = self.request("GET", "/settings/public")
        p_settings = p_res.get("data", {}).get("settings", {})
        self.log("Fetch Public Client Settings (GET /api/v1/settings/public)",
                 p_status == 200 and len(p_settings) >= 30,
                 f"({len(p_settings)} public parameters exposed)")

    def test_update_settings(self):
        print("\n--- 3. Update Settings in PostgreSQL ---")
        update_payload = {
            "settings": {
                "site_name": "HeyGoodly Portal Pro",
                "site_slogan": "Premier Editorial Reviews & Exclusive Discount Codes",
                "contact_email": "editorial@heygoodly.com",
                "gtm_id": "GTM-HG2026X",
                "header_ads_title": "Exclusive Spring Tech Sponsorship Deals",
                "newsletter_title": "Weekly Curated Tech Deals & Editorial Briefings",
                "auth_lockout_seconds": "45"
            }
        }
        status, res = self.request("PUT", "/admin/settings", update_payload)
        updated = res.get("data", {}).get("settings", {})
        self.log("Update Multiple System Settings (PUT /api/v1/admin/settings)",
                 status == 200 and updated.get("site_name") == "HeyGoodly Portal Pro",
                 f"(New Name: {updated.get('site_name')})")

        # Verify persistence with fresh GET
        v_status, v_res = self.request("GET", "/admin/settings")
        persisted = v_res.get("data", {}).get("settings", {})
        persisted_correct = (
            persisted.get("site_name") == "HeyGoodly Portal Pro" and
            persisted.get("site_slogan") == "Premier Editorial Reviews & Exclusive Discount Codes" and
            persisted.get("gtm_id") == "GTM-HG2026X" and
            persisted.get("auth_lockout_seconds") == "45"
        )
        self.log("Verify Settings Persistence in Database", persisted_correct)

    def test_settings_audit_logging(self):
        print("\n--- 4. Verify Audit Log for Settings Modification ---")
        status, res = self.request("GET", "/profile/audit-logs?search=settings")
        logs = res.get("data", [])
        has_audit = any("SETTINGS" in (l.get("action") or "") or "settings" in (l.get("module") or "") for l in logs)
        self.log("Audit Trail Records System Settings Update", status == 200 and has_audit,
                 f"({len(logs)} audit records matched)")

    def test_reset_settings(self):
        print("\n--- 5. Reset to Baseline Factory Defaults ---")
        reset_payload = {
            "settings": {
                "site_name": "HeyGoodly",
                "site_slogan": "Coupon Codes & Honest Tech Reviews",
                "contact_email": "contact@heygoodly.com",
                "gtm_id": "GTM-BG9942A",
                "header_ads_title": "Seasonal Consumer Tech & Smart Home Clearance Deals",
                "newsletter_title": "Independent Reviews & Product Tests, Weekly",
                "auth_lockout_seconds": "30"
            }
        }
        status, res = self.request("PUT", "/admin/settings", reset_payload)
        reset_settings = res.get("data", {}).get("settings", {})
        self.log("Restore Baseline Defaults in PostgreSQL",
                 status == 200 and reset_settings.get("site_name") == "HeyGoodly")

    def run_all(self):
        print("=========================================================")
        print(" HeyGoodly ProCMS - System Settings Automated Test Suite")
        print("=========================================================")
        self.authenticate()
        self.test_get_settings()
        self.test_update_settings()
        self.test_settings_audit_logging()
        self.test_reset_settings()

        print("\n=========================================================")
        print(f" Results: {self.passed} Passed, {self.failed} Failed")
        print("=========================================================")
        if self.failed > 0:
            sys.exit(1)

if __name__ == "__main__":
    runner = TestSettingsRunner()
    runner.run_all()

