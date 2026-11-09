#!/usr/bin/env python3
"""
Comprehensive End-to-End API Test Suite for HeyGoodly Portal.
Tests CRUD and View functionalities across all Admin and Public modules.
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080"

class TestRunner:
    def __init__(self):
        self.token = None
        self.refresh_token = None
        self.results = []

    def request(self, method, path, data=None, auth=True):
        url = f"{BASE_URL}{path}"
        headers = {"Content-Type": "application/json"}
        if auth and self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        body = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req) as response:
                status = response.getcode()
                resp_body = response.read().decode("utf-8")
                try:
                    payload = json.loads(resp_body)
                except Exception:
                    payload = resp_body
                return status, payload
        except urllib.error.HTTPError as e:
            resp_body = e.read().decode("utf-8")
            try:
                payload = json.loads(resp_body)
            except Exception:
                payload = resp_body
            return e.code, payload
        except Exception as e:
            return 0, str(e)

    def test(self, name, method, path, data=None, expected_status=200, auth=True):
        status, payload = self.request(method, path, data, auth)
        success = (status == expected_status)
        self.results.append({
            "name": name,
            "method": method,
            "path": path,
            "status": status,
            "expected": expected_status,
            "success": success,
            "payload": payload
        })
        icon = "✅" if success else "❌"
        print(f"{icon} [{status}] {name} ({method} {path})")
        if not success:
            print(f"   Response: {json.dumps(payload, indent=2)[:300]}")
        return status, payload

def run():
    runner = TestRunner()
    print("=" * 60)
    print("STARTING COMPREHENSIVE API TEST SUITE")
    print("=" * 60)

    # 1. Auth Module
    print("\n--- 1. AUTH MODULE ---")
    status, res = runner.test("Admin Login", "POST", "/api/v1/auth/login", {
        "email": "admin@heygoodly.com",
        "password": "Admin@123456"
    }, expected_status=200, auth=False)

    if status == 200 and isinstance(res, dict) and res.get("data"):
        data = res["data"]
        if data.get("requiresTwoFactor"):
            print("   2FA required. Submitting 2FA verification...")
            v_status, v_res = runner.test("Verify 2FA", "POST", "/api/v1/auth/verify-2fa", {
                "tempToken": data.get("tempToken"),
                "otpCode": 884219
            }, expected_status=200, auth=False)
            if v_status == 200 and isinstance(v_res, dict) and v_res.get("data"):
                runner.token = v_res["data"]["accessToken"]
                runner.refresh_token = v_res["data"]["refreshToken"]
                print("   2FA verified and token acquired successfully.")
            else:
                print("   FAILED to verify 2FA. Aborting admin tests.")
                return
        else:
            runner.token = data["accessToken"]
            runner.refresh_token = data["refreshToken"]
            print("   Token acquired successfully.")
    else:
        print("   FAILED to acquire token. Aborting admin tests.")
        return

    runner.test("Token Refresh", "POST", "/api/v1/auth/refresh", {
        "refreshToken": runner.refresh_token
    }, expected_status=200, auth=False)

    # 2. Dashboard Module
    print("\n--- 2. DASHBOARD MODULE ---")
    runner.test("Get Admin Dashboard Stats (/stats)", "GET", "/api/v1/admin/dashboard/stats")
    runner.test("Get Admin Dashboard Stats (root)", "GET", "/api/v1/admin/dashboard")

    # 3. Stores Module (List, Detail, Create, Update, Delete)
    print("\n--- 3. STORES MODULE ---")
    runner.test("List Admin Stores", "GET", "/api/v1/admin/stores?page=0&size=5")
    runner.test("Get Store Detail (ID=1)", "GET", "/api/v1/admin/stores/1")

    # Create Store
    import time
    ts = int(time.time())
    test_store_slug = f"test-crud-store-{ts}"
    _, create_store_res = runner.test("Create Test Store", "POST", "/api/v1/admin/stores", {
        "name": f"Test CRUD Store {ts}",
        "slug": test_store_slug,
        "websiteUrl": "https://test-crud-store.com",
        "affiliateUrl": "https://test-crud-store.com?ref=heygoodly",
        "shortDescription": "Test store short desc",
        "description": "Full store description test",
        "network": "CUSTOM",
        "affiliateProgram": "Direct Partnership",
        "isActive": True
    })

    created_store_id = None
    if isinstance(create_store_res, dict) and create_store_res.get("data"):
        created_store_id = create_store_res["data"].get("id")

    if created_store_id:
        runner.test("Update Test Store", "PUT", f"/api/v1/admin/stores/{created_store_id}", {
            "name": "Updated Test Store",
            "slug": test_store_slug,
            "websiteUrl": "https://test-crud-store.com",
            "affiliateUrl": "https://test-crud-store.com?ref=heygoodly",
            "shortDescription": "Updated short desc",
            "description": "Updated full store description",
            "network": "CUSTOM",
            "affiliateProgram": "Direct Partnership",
            "isActive": True
        })
        runner.test("Delete Test Store", "DELETE", f"/api/v1/admin/stores/{created_store_id}")

    # 4. Offers Module (List, Detail, Create, Update, Delete)
    print("\n--- 4. OFFERS MODULE ---")
    runner.test("List Admin Offers", "GET", "/api/v1/admin/offers?page=0&size=5")
    runner.test("Get Offer Detail (ID=1)", "GET", "/api/v1/admin/offers/1")

    # Create Offer
    _, create_offer_res = runner.test("Create Test Offer", "POST", "/api/v1/admin/offers", {
        "storeId": 1,
        "name": "Test 50% Off Everything Coupon",
        "code": "TEST50",
        "discountValue": "50% Off",
        "urlRef": "https://nilight.com?code=TEST50",
        "description": "Test offer description",
        "isActive": True
    })

    created_offer_id = None
    if isinstance(create_offer_res, dict) and create_offer_res.get("data"):
        created_offer_id = create_offer_res["data"].get("id")

    if created_offer_id:
        runner.test("Update Test Offer", "PUT", f"/api/v1/admin/offers/{created_offer_id}", {
            "storeId": 1,
            "name": "Updated 60% Off Everything Coupon",
            "code": "TEST60",
            "discountValue": "60% Off",
            "urlRef": "https://nilight.com?code=TEST60",
            "description": "Updated offer description",
            "isActive": True
        })
        runner.test("Delete Test Offer", "DELETE", f"/api/v1/admin/offers/{created_offer_id}")

    # 5. Posts Module (List, Status Filter, Detail, Create, Update, Delete)
    print("\n--- 5. POSTS MODULE ---")
    runner.test("List Admin Posts", "GET", "/api/v1/admin/posts?page=0&size=5")
    runner.test("List Scheduled Posts", "GET", "/api/v1/admin/posts?status=SCHEDULED")
    runner.test("List Draft Posts", "GET", "/api/v1/admin/posts?status=DRAFT")
    runner.test("Get Post Detail (ID=19)", "GET", "/api/v1/admin/posts/19")

    # Create Post
    test_post_slug = f"test-crud-post-review-{ts}"
    _, create_post_res = runner.test("Create Test Post", "POST", "/api/v1/admin/posts", {
        "title": f"Test CRUD Post Review {ts}",
        "slug": test_post_slug,
        "excerpt": "Excerpt for test CRUD post review",
        "content": "<h2>Testing</h2><p>Content for testing CRUD</p>",
        "status": "PUBLISHED",
        "isActive": True
    })

    created_post_id = None
    if isinstance(create_post_res, dict) and create_post_res.get("data"):
        created_post_id = create_post_res["data"].get("id")

    if created_post_id:
        runner.test("Update Test Post", "PUT", f"/api/v1/admin/posts/{created_post_id}", {
            "title": "Updated Test CRUD Post Review",
            "slug": test_post_slug,
            "excerpt": "Updated excerpt for test review",
            "content": "<h2>Updated Testing</h2><p>Updated content</p>",
            "status": "DRAFT",
            "isActive": False
        })
        runner.test("Delete Test Post", "DELETE", f"/api/v1/admin/posts/{created_post_id}")

    # 6. Categories Module
    print("\n--- 6. CATEGORIES MODULE ---")
    runner.test("List Categories", "GET", "/api/v1/admin/categories")
    runner.test("Get Category Detail (ID=1)", "GET", "/api/v1/admin/categories/1")

    test_cat_slug = f"test-crud-cat-{ts}"
    _, create_cat_res = runner.test("Create Category", "POST", "/api/v1/admin/categories", {
        "name": f"Test CRUD Category {ts}",
        "slug": test_cat_slug,
        "description": "Category for CRUD test",
        "icon": "Tag",
        "isActive": True
    })

    created_cat_id = None
    if isinstance(create_cat_res, dict) and create_cat_res.get("data"):
        created_cat_id = create_cat_res["data"].get("id")

    if created_cat_id:
        runner.test("Update Category", "PUT", f"/api/v1/admin/categories/{created_cat_id}", {
            "name": "Updated Test Category",
            "slug": test_cat_slug,
            "description": "Updated category description",
            "icon": "Tag",
            "isActive": True
        })
        runner.test("Delete Category", "DELETE", f"/api/v1/admin/categories/{created_cat_id}")

    # 7. Media Module
    print("\n--- 7. MEDIA MODULE ---")
    runner.test("List Media Assets", "GET", "/api/v1/admin/media?page=0&size=6")
    runner.test("List Media Assets by Category (stores)", "GET", "/api/v1/admin/media?category=stores&size=6")
    runner.test("List Media Tags", "GET", "/api/v1/admin/media/tags")
    runner.test("Get Media Tag Counts", "GET", "/api/v1/admin/media/tags/counts")

    # 8. Navigation Menus Module
    print("\n--- 8. NAVIGATION MENUS MODULE ---")
    runner.test("List Menus", "GET", "/api/v1/admin/menus")

    # 9. Static Pages Module
    print("\n--- 9. STATIC PAGES MODULE ---")
    runner.test("List Static Pages", "GET", "/api/v1/admin/pages")
    runner.test("Get Static Page (ID=1)", "GET", "/api/v1/admin/pages/1")

    # 10. Feedback & Customer Inquiries Module
    print("\n--- 10. FEEDBACK MODULE ---")
    runner.test("List Feedbacks", "GET", "/api/v1/admin/feedbacks?page=0&size=5")

    # 11. Subscribers Module
    print("\n--- 11. SUBSCRIBERS MODULE ---")
    runner.test("List Subscribers", "GET", "/api/v1/admin/subscribers?page=0&size=5")

    # 12. Users & Profile Module
    print("\n--- 12. USERS & PROFILE MODULE ---")
    runner.test("List Users", "GET", "/api/v1/admin/users?page=0&size=5")
    runner.test("Get Admin User Detail (ID=1)", "GET", "/api/v1/admin/users/1")
    runner.test("Get Profile Detail", "GET", "/api/v1/profile")

    # 13. Roles & Permissions Module
    print("\n--- 13. ROLES & PERMISSIONS MODULE ---")
    runner.test("List Roles", "GET", "/api/v1/admin/roles")
    runner.test("Get Role Permissions List", "GET", "/api/v1/admin/roles/permissions")

    # 14. Settings Module
    print("\n--- 14. SETTINGS MODULE ---")
    runner.test("List System Settings", "GET", "/api/v1/admin/settings")

    # 15. Audit Logs & Tracing
    print("\n--- 15. AUDIT LOGS & TRACING ---")
    runner.test("List Audit Logs", "GET", "/api/v1/admin/audit?page=0&size=5")
    runner.test("List Tracing / Outbound Clicks", "GET", "/api/v1/admin/tracing?page=0&size=5")

    # 16. Public Client APIs
    print("\n--- 16. PUBLIC CLIENT APIS ---")
    runner.test("Public Stores", "GET", "/api/v1/public/stores?size=5", auth=False)
    runner.test("Public Offers", "GET", "/api/v1/public/offers?size=5", auth=False)
    runner.test("Public Posts", "GET", "/api/v1/public/posts?size=5", auth=False)
    runner.test("Public Categories", "GET", "/api/v1/public/categories", auth=False)
    runner.test("Public Universal Search", "GET", "/api/v1/public/search?q=tech", auth=False)

    # Summary
    total = len(runner.results)
    passed = sum(1 for r in runner.results if r["success"])
    failed = total - passed

    print("\n" + "=" * 60)
    print(f"TEST SUMMARY: Total: {total} | Passed: {passed} | Failed: {failed}")
    print("=" * 60)

    if failed > 0:
        print("\nFailed Tests:")
        for r in runner.results:
            if not r["success"]:
                print(f"❌ {r['name']} ({r['method']} {r['path']}) -> Status {r['status']}, expected {r['expected']}")
        sys.exit(1)
    else:
        print("\nALL APIs TESTED SUCCESSFULLY! 🎉")
        sys.exit(0)

if __name__ == "__main__":
    run()
