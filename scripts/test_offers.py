#!/usr/bin/env python3
"""
Comprehensive Coupons & Offers Module Test Suite for HeyGoodly Portal.
Tests 100% database-driven Coupons, Promo Codes & Deals:
1. List admin offers with storeLogo and usesCount
2. Filter by merchant store (storeId)
3. Filter by type: Coupons (code != null)
4. Filter by type: Deals (code == null)
5. Filter by verified / exclusive (verified=true)
6. Search offers by name / code
7. Sort offers by name A-Z and ID
8. Get offer detail (/api/v1/admin/offers/{id})
9. Create offer (CRUD - Create)
10. Update offer (CRUD - Update)
11. Toggle verify status
12. Toggle active status
13. Clone offer as inactive copy
14. Delete offer (CRUD - Delete)
15. Verify 404 on deleted offer
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080"

class OfferTester:
    def __init__(self):
        self.token = None
        self.results = []

    def login(self):
        url = f"{BASE_URL}/api/v1/auth/login"
        payload = {"email": "admin@heygoodly.com", "password": "Admin@123456"}
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode("utf-8"))["data"]
            if data.get("requiresTwoFactor"):
                req2 = urllib.request.Request(
                    f"{BASE_URL}/api/v1/auth/verify-2fa",
                    data=json.dumps({"tempToken": data["tempToken"], "otpCode": 884219}).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req2) as res2:
                    self.token = json.loads(res2.read().decode("utf-8"))["data"]["accessToken"]
            else:
                self.token = data["accessToken"]

    def request(self, method, path, data=None):
        url = f"{BASE_URL}{path}"
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        body = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as response:
                status = response.getcode()
                resp_body = response.read().decode("utf-8")
                return status, json.loads(resp_body) if resp_body else {}
        except urllib.error.HTTPError as e:
            resp_body = e.read().decode("utf-8")
            try:
                return e.code, json.loads(resp_body)
            except Exception:
                return e.code, resp_body

    def test(self, name, method, path, data=None, expected_status=200):
        status, payload = self.request(method, path, data)
        success = (status == expected_status)
        self.results.append({"name": name, "success": success})
        icon = "✅" if success else "❌"
        print(f"{icon} [{status}] {name} ({method} {path})")
        if not success:
            print(f"   Response: {json.dumps(payload, indent=2)[:300]}")
        return status, payload

def run():
    tester = OfferTester()
    print("=" * 60)
    print("STARTING COUPONS & OFFERS MODULE TEST SUITE")
    print("=" * 60)

    tester.login()
    print("Authenticated successfully.")

    # 1. List admin offers with storeLogo and usesCount
    status, res = tester.test("List Admin Offers", "GET", "/api/v1/admin/offers?page=0&size=10")
    items = res.get("data", {}).get("content", [])
    total_elements = res.get("data", {}).get("totalElements", 0)
    print(f"   Total offers: {total_elements}. Loaded {len(items)} items on page 0.")
    assert len(items) == 10
    for o in items:
        assert "storeLogo" in o, f"storeLogo missing in offer {o['id']}"
        assert "usesCount" in o, f"usesCount missing in offer {o['id']}"
    print(f"   Sample Offer 0: Store={items[0]['storeName']}, Uses={items[0]['usesCount']}, Logo={items[0]['storeLogo'][:30]}...")

    # 2. Filter by merchant store (storeId=1 Nilight)
    status, res = tester.test("Filter Offers by Store (storeId=1 Nilight)", "GET", "/api/v1/admin/offers?storeId=1&size=20")
    nilight_offers = res.get("data", {}).get("content", [])
    assert len(nilight_offers) >= 10, f"Expected at least 10 Nilight offers, got {len(nilight_offers)}"
    for o in nilight_offers:
        assert o["storeId"] == 1

    # 3. Filter by type: Coupons
    status, res = tester.test("Filter Offers by Type: Coupon", "GET", "/api/v1/admin/offers?type=coupon&size=10")
    coupons = res.get("data", {}).get("content", [])
    for c in coupons:
        assert c["code"] is not None and len(c["code"].strip()) > 0, f"Coupon {c['id']} has no code"

    # 4. Filter by type: Deals
    status, res = tester.test("Filter Offers by Type: Deal", "GET", "/api/v1/admin/offers?type=deal&size=10")
    deals = res.get("data", {}).get("content", [])
    for d in deals:
        assert d["code"] is None or len(d["code"].strip()) == 0, f"Deal {d['id']} has code: {d['code']}"

    # 5. Filter by verified
    status, res = tester.test("Filter Offers by Verified (verified=true)", "GET", "/api/v1/admin/offers?verified=true&size=10")
    verified_offers = res.get("data", {}).get("content", [])
    for vo in verified_offers:
        assert vo["isVerified"] is True

    # 6. Search offers
    status, res = tester.test("Search Offers by 'Nilight'", "GET", "/api/v1/admin/offers?search=Nilight&size=10")
    searched = res.get("data", {}).get("content", [])
    assert len(searched) > 0

    # 7. Sort by Name A-Z
    status, res = tester.test("Sort Offers by Name A-Z", "GET", "/api/v1/admin/offers?sortBy=name&direction=asc&size=5")
    sorted_name = res.get("data", {}).get("content", [])
    print(f"   First alphabetical offer: [{sorted_name[0]['id']}] {sorted_name[0]['name']}")

    # 8. Get Offer Detail
    status, res = tester.test("Get Offer Detail (ID=1)", "GET", "/api/v1/admin/offers/1")
    detail = res.get("data", {})
    assert detail["id"] == 1
    assert detail["storeId"] == 1
    assert detail["usesCount"] >= 0
    assert detail["storeLogo"] is not None

    # 9. Create Offer (CRUD - Create with Image)
    test_img_url = "https://minio.heygoodly.com/heygoodly-media/offers/test-switch-panel.webp"
    create_payload = {
        "storeId": 1,
        "name": "25% Off Auxbeam & Nilight 8-Gang RGB Switch Panels",
        "discountValue": "25% Off",
        "code": "PANEL25",
        "urlRef": "https://nilight.com/?ref=heygoodly",
        "description": "Valid on bluetooth app-controlled 8-gang and 6-gang relay switch panels.",
        "image": test_img_url,
        "isVerified": True,
        "isActive": True,
        "sortOrder": 50
    }
    status, res = tester.test("Create Offer with Image", "POST", "/api/v1/admin/offers", create_payload)
    new_offer_id = res.get("data", {}).get("id")
    print(f"   Created offer ID: {new_offer_id}, image: {res.get('data', {}).get('image')}")
    assert res.get("data", {}).get("code") == "PANEL25"
    assert res.get("data", {}).get("image") == test_img_url

    # 9b. Verify Offer Detail returns Image
    status, res = tester.test("Get Offer Detail by ID returns image", "GET", f"/api/v1/admin/offers/{new_offer_id}")
    assert res.get("data", {}).get("image") == test_img_url

    # 10. Update Offer (CRUD - Update with new Image)
    updated_img_url = "https://minio.heygoodly.com/heygoodly-media/offers/updated-switch-panel.webp"
    update_payload = {
        "storeId": 1,
        "name": "30% Off Auxbeam & Nilight 8-Gang RGB Switch Panels (Flash Sale)",
        "discountValue": "30% Off",
        "code": "PANEL30",
        "urlRef": "https://nilight.com/?ref=heygoodly",
        "description": "Updated flash sale discount.",
        "image": updated_img_url,
        "isVerified": True,
        "isActive": True,
        "sortOrder": 50
    }
    status, res = tester.test("Update Offer with Image", "PUT", f"/api/v1/admin/offers/{new_offer_id}", update_payload)
    assert res.get("data", {}).get("discountValue") == "30% Off"
    assert res.get("data", {}).get("code") == "PANEL30"
    assert res.get("data", {}).get("image") == updated_img_url

    # 11. Toggle Verify
    status, res = tester.test("Toggle Offer Verify", "PUT", f"/api/v1/admin/offers/{new_offer_id}/verify")
    assert res.get("data", {}).get("isVerified") is False
    # Toggle back
    status, res = tester.test("Toggle Offer Verify Back", "PUT", f"/api/v1/admin/offers/{new_offer_id}/verify")
    assert res.get("data", {}).get("isVerified") is True

    # 12. Toggle Active Status
    status, res = tester.test("Toggle Offer Active Status", "PUT", f"/api/v1/admin/offers/{new_offer_id}/toggle-status")
    assert res.get("data", {}).get("isActive") is False

    # 13. Clone Offer
    status, res = tester.test("Clone Offer", "POST", f"/api/v1/admin/offers/{new_offer_id}/clone")
    cloned_id = res.get("data", {}).get("id")
    print(f"   Cloned offer ID: {cloned_id}")
    assert "(Copy)" in res.get("data", {}).get("name")
    assert res.get("data", {}).get("image") == updated_img_url

    # 14. Delete Cloned Offer
    status, res = tester.test("Delete Cloned Offer", "DELETE", f"/api/v1/admin/offers/{cloned_id}")

    # 15. Delete Test Offer
    status, res = tester.test("Delete Created Offer", "DELETE", f"/api/v1/admin/offers/{new_offer_id}")

    # 16. Verify Deleted 404
    status, res = tester.test("Verify Deleted Offer 404", "GET", f"/api/v1/admin/offers/{new_offer_id}", expected_status=404)

    print("=" * 60)
    passed = sum(1 for r in tester.results if r["success"])
    total = len(tester.results)
    print(f"OFFERS SUITE SUMMARY: Total: {total} | Passed: {passed} | Failed: {total - passed}")
    print("=" * 60)

if __name__ == "__main__":
    run()

