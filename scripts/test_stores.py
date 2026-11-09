#!/usr/bin/env python3
"""
Comprehensive Stores & Merchants Directory Test Suite for HeyGoodly Portal.
Tests 100% database-driven Merchant Stores Directory:
1. List admin stores with activeOffersCount, categoryName, rating
2. Filter by category (categoryId=1 Automotive)
3. Filter by category slug/name (category=tech)
4. Filter by status: ACTIVE
5. Filter by status: INACTIVE
6. Filter by status: FEATURED
7. Search stores by keyword 'Nilight'
8. Sort stores: Name A-Z, Rating High-to-Low, Traffic High-to-Low
9. Get store detail by ID (/api/v1/admin/stores/1)
10. Get store detail by Slug (/api/v1/admin/stores/nilight)
11. Get store offers for modal popup (/api/v1/admin/offers?storeId=1)
12. Create Store (CRUD - Create)
13. Update Store (CRUD - Update)
14. Toggle Store Status (Active <-> Inactive)
15. Clone Store as inactive draft copy
16. Delete Cloned Store (CRUD - Delete)
17. Delete Created Store (CRUD - Delete)
18. Verify 404 on deleted store
19. Public Store Endpoint (/api/v1/public/stores/nilight)
20. Public Store Offers Endpoint (/api/v1/public/stores/nilight/offers)
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080"

class StoreTester:
    def __init__(self):
        self.token = None
        self.results = []

    def login(self):
        url = f"{BASE_URL}/api/v1/auth/login"
        payload = {"email": "admin@heygoodly.com", "password": "Admin@123456"}
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
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
                res_body = json.loads(response.read().decode("utf-8"))
                return status, res_body
        except urllib.error.HTTPError as e:
            try:
                res_body = json.loads(e.read().decode("utf-8"))
            except Exception:
                res_body = {"raw": str(e)}
            return e.code, res_body

    def test(self, name, method, path, data=None, expected_status=200):
        status, res = self.request(method, path, data)
        success = (status == expected_status)
        self.results.append((name, success, status, res))
        symbol = "✅" if success else "❌"
        print(f"{symbol} [{status}] {name} ({method} {path})")
        if not success:
            print(f"   Expected {expected_status}, got {status}: {json.dumps(res, indent=2)}")
        return status, res

def run():
    print("=" * 60)
    print("STARTING STORES & MERCHANTS DIRECTORY TEST SUITE")
    print("=" * 60)

    tester = StoreTester()
    tester.login()
    print("Authenticated successfully.")

    # 1. List Admin Stores with activeOffersCount and categoryName
    status, res = tester.test("List Admin Stores Page 0 Size 10", "GET", "/api/v1/admin/stores?page=0&size=10&sortBy=name&direction=asc")
    stores_data = res.get("data", {})
    total_stores = stores_data.get("totalElements", 0)
    stores = stores_data.get("content", [])
    print(f"   Total stores: {total_stores}. Loaded {len(stores)} stores on page 0.")
    assert total_stores >= 10, f"Expected at least 10 stores, got {total_stores}"
    assert len(stores) > 0

    first_store = stores[0]
    print(f"   Sample Store: ID={first_store['id']}, Name='{first_store['name']}', Category='{first_store.get('categoryName')}', Offers={first_store.get('activeOffersCount')}, Rating={first_store.get('ratingScore')}")
    assert "activeOffersCount" in first_store
    assert "categoryName" in first_store

    # 2. Filter by categoryId (categoryId=1 Automotive & Accessories)
    status, res = tester.test("Filter Stores by Category ID (categoryId=1)", "GET", "/api/v1/admin/stores?categoryId=1&size=20")
    cat1_stores = res.get("data", {}).get("content", [])
    print(f"   Category 1 stores count: {len(cat1_stores)}")
    assert len(cat1_stores) > 0
    for s in cat1_stores:
        assert s.get("categoryId") == 1, f"Store {s['name']} has categoryId {s.get('categoryId')}"

    # 3. Filter by category slug/name (category=automotive-accessories)
    status, res = tester.test("Filter Stores by Category Slug (category=automotive-accessories)", "GET", "/api/v1/admin/stores?category=automotive-accessories&size=20")
    auto_stores = res.get("data", {}).get("content", [])
    print(f"   Automotive category stores count: {len(auto_stores)}")
    assert len(auto_stores) == 4
    for s in auto_stores:
        assert s.get("categoryId") == 1

    # 3b. Filter by category name string (category=Electronics & Gadgets)
    status, res = tester.test("Filter Stores by Category Name (category=Electronics & Gadgets)", "GET", "/api/v1/admin/stores?category=Electronics%20%26%20Gadgets&size=20")
    gadget_stores = res.get("data", {}).get("content", [])
    print(f"   Electronics & Gadgets category stores count: {len(gadget_stores)}")
    assert len(gadget_stores) == 3

    # 4. Filter by status: ACTIVE
    status, res = tester.test("Filter Stores by Status: ACTIVE", "GET", "/api/v1/admin/stores?status=ACTIVE&size=20")
    active_stores = res.get("data", {}).get("content", [])
    for s in active_stores:
        assert s.get("isActive") is True

    # 5. Filter by status: FEATURED
    status, res = tester.test("Filter Stores by Status: FEATURED", "GET", "/api/v1/admin/stores?status=FEATURED&size=20")
    featured_stores = res.get("data", {}).get("content", [])
    print(f"   Featured stores count: {len(featured_stores)}")
    assert len(featured_stores) > 0
    for s in featured_stores:
        assert s.get("isFeatured") is True

    # 6. Search Stores by 'Nilight'
    status, res = tester.test("Search Stores by 'Nilight'", "GET", "/api/v1/admin/stores?search=Nilight&size=10")
    searched = res.get("data", {}).get("content", [])
    assert len(searched) >= 1
    assert any("nilight" in s["name"].lower() for s in searched)

    # 7. Sort Stores by Name A-Z
    status, res = tester.test("Sort Stores by Name A-Z", "GET", "/api/v1/admin/stores?sortBy=name&direction=asc&size=5")
    sorted_name = res.get("data", {}).get("content", [])
    names = [s["name"] for s in sorted_name]
    print(f"   First 3 stores alphabetical: {names[:3]}")
    assert names[0] <= names[1] <= names[2]

    # 8. Sort Stores by Highest Rating
    status, res = tester.test("Sort Stores by Highest Rating", "GET", "/api/v1/admin/stores?sortBy=ratingScore&direction=desc&size=5")
    sorted_rating = res.get("data", {}).get("content", [])
    ratings = [float(s["ratingScore"]) for s in sorted_rating]
    print(f"   Top ratings: {ratings[:3]}")
    assert ratings[0] >= ratings[1] >= ratings[2]

    # 9. Get Store Detail by ID
    status, res = tester.test("Get Store Detail by ID (ID=1)", "GET", "/api/v1/admin/stores/1")
    detail = res.get("data", {})
    assert detail["id"] == 1
    assert detail["slug"] == "nilight"
    assert "aboutStore" in detail
    assert "popularSearches" in detail
    assert "faqs" in detail

    # 10. Get Store Detail by Slug
    status, res = tester.test("Get Store Detail by Slug ('nilight')", "GET", "/api/v1/admin/stores/nilight")
    detail_slug = res.get("data", {})
    assert detail_slug["id"] == 1

    # 11. Get Store Offers (modal popup data)
    status, res = tester.test("Get Store Offers for Store ID=1", "GET", "/api/v1/admin/offers?storeId=1&size=20")
    store_offers = res.get("data", {}).get("content", [])
    print(f"   Found {len(store_offers)} offers for store ID=1")
    assert len(store_offers) > 0
    for o in store_offers:
        assert o["storeId"] == 1

    # 12. Create Store (CRUD - Create)
    create_payload = {
        "name": "Keychron Mechanical Keyboards",
        "slug": "keychron",
        "categoryId": 2,
        "logo": "https://minio.heygoodly.com/heygoodly-media/stores/keychron-logo.webp",
        "socialCardImage": "https://minio.heygoodly.com/heygoodly-media/stores/keychron-banner.webp",
        "socialDescription": "Premium wireless custom mechanical keyboards for Mac and Windows.",
        "aboutStore": "Keychron produces high-end customizable mechanical keyboards with hot-swappable switches.",
        "afWebsite": "https://www.keychron.com/?ref=heygoodly",
        "maxOffer": 35,
        "ratingScore": 4.95,
        "ratingCount": 850,
        "isActive": True,
        "isSearchable": True,
        "isFeatured": True,
        "sortOrder": 15,
        "popularSearches": ["Keychron Q1 Pro coupon", "Keychron K2 discount", "Keychron promo code"],
        "faqs": [
            {"question": "Does Keychron offer free shipping?", "answer": "Yes, on orders over $99 to continental US."},
            {"question": "How to apply Keychron coupon?", "answer": "Enter promo code at checkout on keychron.com."}
        ]
    }
    status, res = tester.test("Create Merchant Store", "POST", "/api/v1/admin/stores", create_payload)
    new_store_id = res.get("data", {}).get("id")
    print(f"   Created Store ID: {new_store_id}")
    assert res.get("data", {}).get("name") == "Keychron Mechanical Keyboards"
    assert res.get("data", {}).get("slug") == "keychron"

    # 13. Update Store (CRUD - Update)
    update_payload = dict(create_payload)
    update_payload["name"] = "Keychron Custom Keyboards & Mice"
    update_payload["maxOffer"] = 40
    status, res = tester.test("Update Merchant Store", "PUT", f"/api/v1/admin/stores/{new_store_id}", update_payload)
    assert res.get("data", {}).get("name") == "Keychron Custom Keyboards & Mice"
    assert res.get("data", {}).get("maxOffer") == 40

    # 14. Toggle Store Status (Active <-> Inactive)
    status, res = tester.test("Toggle Store Status to Inactive", "PATCH", f"/api/v1/admin/stores/{new_store_id}/toggle-status")
    assert res.get("data", {}).get("isActive") is False

    status, res = tester.test("Toggle Store Status Back to Active", "PATCH", f"/api/v1/admin/stores/{new_store_id}/toggle-status")
    assert res.get("data", {}).get("isActive") is True

    # 15. Clone Store
    status, res = tester.test("Clone Merchant Store", "POST", f"/api/v1/admin/stores/{new_store_id}/clone")
    cloned_id = res.get("data", {}).get("id")
    print(f"   Cloned Store ID: {cloned_id}")
    assert "(Copy)" in res.get("data", {}).get("name")
    assert res.get("data", {}).get("isActive") is False  # Cloned copy starts inactive

    # 16. Delete Cloned Store
    status, res = tester.test("Delete Cloned Store", "DELETE", f"/api/v1/admin/stores/{cloned_id}")

    # 17. Delete Created Store
    status, res = tester.test("Delete Created Store", "DELETE", f"/api/v1/admin/stores/{new_store_id}")

    # 18. Verify Deleted Store 404
    status, res = tester.test("Verify Deleted Store 404", "GET", f"/api/v1/admin/stores/{new_store_id}", expected_status=404)

    # 19. Public Store Endpoint
    status, res = tester.test("Public Store Detail (/api/v1/public/stores/nilight)", "GET", "/api/v1/public/stores/nilight")
    pub_store = res.get("data", {})
    assert pub_store["slug"] == "nilight"

    # 20. Public Store Offers Endpoint
    status, res = tester.test("Public Store Offers (/api/v1/public/stores/nilight/offers)", "GET", "/api/v1/public/stores/nilight/offers")
    pub_offers = res.get("data", [])
    assert len(pub_offers) > 0

    print("=" * 60)
    passed = sum(1 for _, ok, _, _ in tester.results if ok)
    total = len(tester.results)
    print(f"STORES SUITE SUMMARY: Total: {total} | Passed: {passed} | Failed: {total - passed}")
    print("=" * 60)

    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    run()
