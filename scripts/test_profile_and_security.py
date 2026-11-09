#!/usr/bin/env python3
"""
HeyGoodly ProCMS - Profile & Security Automated Test Suite
Validates 100% database-driven profile management, 2FA unlock gate,
credential verification, recovery codes regeneration, active sessions,
security audit logs, and notification preferences.
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080/api/v1"
ADMIN_EMAIL = "admin@heygoodly.com"
ADMIN_PASS = "Admin@123456"

class TestProfileRunner:
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

    def test_profile_read_and_update(self):
        print("\n--- 2. Profile Details (Read & Update) ---")
        status, res = self.request("GET", "/profile")
        profile = res.get("data", {})
        self.log("Get Profile Details", status == 200 and profile.get("email") == ADMIN_EMAIL,
                 f"({profile.get('fullName')}, Role: {profile.get('roleName')})")

        # Update profile
        update_payload = {
            "fullName": "Super Administrator",
            "phone": "+1 (800) 555-0199",
            "department": "Platform Security & Strategy",
            "timezone": "UTC+07:00 (Bangkok, Hanoi, Jakarta)",
            "bio": "Lead administrator managing HeyGoodly affiliate operations.",
            "socialX": "https://x.com/heygoodly",
            "socialLinkedIn": "https://linkedin.com/in/heygoodly",
            "avatar": profile.get("avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
        }
        u_status, u_res = self.request("PUT", "/profile", update_payload)
        u_data = u_res.get("data", {})
        self.log("Update Profile Details", u_status == 200 and u_data.get("department") == "Platform Security & Strategy")

    def test_password_verification(self):
        print("\n--- 3. Password Verification Gate ---")
        # Incorrect password
        bad_status, _ = self.request("POST", "/profile/verify-password", {"password": "WrongPassword999!"})
        self.log("Verify Password (Wrong Password Rejected)", bad_status == 400)

        # Correct password
        good_status, good_res = self.request("POST", "/profile/verify-password", {"password": ADMIN_PASS})
        self.log("Verify Password (Correct Password Accepted)", good_status == 200 and good_res.get("data") is True)

    def test_2fa_unlock_and_recovery_codes(self):
        print("\n--- 4. 2FA Security Gate & Recovery Codes ---")
        # Unlock with wrong password
        bad_status, _ = self.request("POST", "/profile/2fa/unlock", {"password": "InvalidPassword123!"})
        self.log("2FA Unlock Gate (Wrong Password Rejected)", bad_status == 400)

        # Unlock with correct password
        ok_status, ok_res = self.request("POST", "/profile/2fa/unlock", {"password": ADMIN_PASS})
        two_fa_data = ok_res.get("data", {})
        has_secret = bool(two_fa_data.get("secretKey"))
        recovery_codes = two_fa_data.get("recoveryCodes", [])
        self.log("2FA Unlock Gate (Correct Password Unlocked)",
                 ok_status == 200 and two_fa_data.get("twoFactorEnabled") is True and has_secret,
                 f"(Codes count: {len(recovery_codes)})")

        # Regenerate 8 new recovery codes
        regen_status, regen_res = self.request("POST", "/profile/2fa/regenerate-recovery-codes", {})
        new_codes = regen_res.get("data", [])
        self.log("Regenerate 8 New Recovery Codes", regen_status == 200 and len(new_codes) == 8,
                 f"(Sample: {new_codes[0] if new_codes else 'N/A'})")

        # Test TOTP Validation Simulator
        totp_status, totp_res = self.request("POST", "/auth/2fa/test?otpCode=884219", {})
        self.log("TOTP Simulator (Dev / In-Sync Code 884219 Validated)",
                 totp_status == 200 and totp_res.get("data") is True)

        bad_totp_status, bad_totp_res = self.request("POST", "/auth/2fa/test?otpCode=111111", {})
        self.log("TOTP Simulator (Arbitrary Code 111111 Rejected)",
                 bad_totp_status == 200 and bad_totp_res.get("data") is False)

    def test_sessions_and_lockdown(self):
        print("\n--- 5. Active Devices Sessions & Deduplication ---")
        status, res = self.request("GET", "/profile/sessions")
        sessions = res.get("data", [])
        self.log("Fetch Active Device Sessions", status == 200 and isinstance(sessions, list),
                 f"({len(sessions)} active sessions in PostgreSQL)")

        # Verify deduplication on subsequent login
        self.authenticate()
        status2, res2 = self.request("GET", "/profile/sessions")
        sessions2 = res2.get("data", [])
        self.log("Session Deduplication on Re-Authentication / F5",
                 status2 == 200 and len(sessions2) == len(sessions) and sessions2[0].get("isCurrent") is True,
                 f"(Unique sessions: {len(sessions2)})")

        if len(sessions) > 1:
            target_sess = sessions[-1]
            rev_status, _ = self.request("DELETE", f"/profile/sessions/{target_sess['id']}")
            self.log(f"Revoke Single Device Session (ID {target_sess['id']})", rev_status == 200)

        # Test Emergency Lockdown (Revoke other sessions)
        lock_status, _ = self.request("DELETE", "/profile/sessions/other")
        self.log("Emergency Lockdown (Revoke Other Remote Sessions)", lock_status == 200)

        # Confirm only current session remains
        _, remaining = self.request("GET", "/profile/sessions")
        rem_list = remaining.get("data", [])
        self.log("Verify Sessions State Post-Lockdown", len(rem_list) == 1 and rem_list[0].get("isCurrent") is True)

    def test_security_audit_logs(self):
        print("\n--- 6. Security Audit Logs (Single API with Filters) ---")
        status, res = self.request("GET", "/profile/audit-logs")
        logs = res.get("data", [])
        self.log("Fetch Security Audit Trail (All)", status == 200 and isinstance(logs, list),
                 f"({len(logs)} audit events retrieved)")

        # Test Filter by Type = LOGIN
        s_login, r_login = self.request("GET", "/profile/audit-logs?type=LOGIN")
        login_logs = r_login.get("data", [])
        self.log("Filter Audit Logs by Type: LOGIN",
                 s_login == 200 and len(login_logs) > 0,
                 f"({len(login_logs)} login events)")

        # Test Filter by Type = 2FA
        s_2fa, r_2fa = self.request("GET", "/profile/audit-logs?type=2FA")
        twofa_logs = r_2fa.get("data", [])
        self.log("Filter Audit Logs by Type: 2FA",
                 s_2fa == 200 and len(twofa_logs) > 0,
                 f"({len(twofa_logs)} 2FA/recovery events)")

        # Test Filter by Type = PROFILE
        s_prof, r_prof = self.request("GET", "/profile/audit-logs?type=PROFILE")
        prof_logs = r_prof.get("data", [])
        self.log("Filter Audit Logs by Type: PROFILE",
                 s_prof == 200 and len(prof_logs) > 0,
                 f"({len(prof_logs)} profile update events)")

        # Test Search Query
        s_search, r_search = self.request("GET", "/profile/audit-logs?search=ProCMS")
        search_logs = r_search.get("data", [])
        self.log("Search Audit Logs via Query ('ProCMS')",
                 s_search == 200 and len(search_logs) > 0,
                 f"({len(search_logs)} matching events)")

    def test_notifications_preferences(self):
        print("\n--- 7. Notification Preferences ---")
        status, res = self.request("GET", "/profile/notifications")
        prefs = res.get("data", {})
        self.log("Fetch Notification Preferences", status == 200 and isinstance(prefs, dict))

        update_prefs = {
            "securityLogins": True,
            "twoFaChanges": True,
            "commissionSpikes": True,
            "couponExpirations": True,
            "customerFeedback": True,
            "browserPush": True
        }
        u_status, u_res = self.request("PUT", "/profile/notifications", update_prefs)
        updated = u_res.get("data", {})
        self.log("Update Notification Preferences in PostgreSQL",
                 u_status == 200 and updated.get("browserPush") is True)

    def run_all(self):
        print("=========================================================")
        print(" HeyGoodly ProCMS - Profile & Security Suite Test")
        print("=========================================================")
        self.authenticate()
        self.test_profile_read_and_update()
        self.test_password_verification()
        self.test_2fa_unlock_and_recovery_codes()
        self.test_sessions_and_lockdown()
        self.test_security_audit_logs()
        self.test_notifications_preferences()

        print("\n=========================================================")
        print(f" Results: {self.passed} Passed, {self.failed} Failed")
        print("=========================================================")
        if self.failed > 0:
            sys.exit(1)

if __name__ == "__main__":
    runner = TestProfileRunner()
    runner.run_all()

