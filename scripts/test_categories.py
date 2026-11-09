#!/usr/bin/env python3
"""
Comprehensive Category Module Test Suite for HeyGoodly Portal.
Tests 100% database-driven Category features:
1. Category listing with real post counts
2. Category detail retrieval
3. Category post articles lookup (CategoryArticlesModal query)
4. Category creation (CRUD - Create)
5. Category update (CRUD - Update)
6. Category delete (CRUD - Delete)
7. Sidebar stats consistency (countByIsDeletedFalse)
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080"

class CategoryTester:
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
    tester = CategoryTester()
    print("=" * 60)
    print("STARTING CATEGORY MODULE TEST SUITE")
    print("=" * 60)

    tester.login()
    print("Authenticated successfully.")

    # 1. Sidebar stats count
    status, stats = tester.test("Dashboard Sidebar Categories Count", "GET", "/api/v1/admin/dashboard/stats")
    cats_count = stats.get("data", {}).get("categoriesCount")
    print(f"   Dashboard reports {cats_count} active categories (expected 11, not 20).")
    assert cats_count == 11, f"Expected 11 categories in dashboard, got {cats_count}"

    # 2. List categories with real post counts
    status, cat_list = tester.test("List Admin Categories", "GET", "/api/v1/admin/categories?size=20")
    items = cat_list.get("data", {}).get("content", [])
    print(f"   Loaded {len(items)} categories.")
    for item in items:
        print(f"   - [{item['id']}] {item['name']} ({item['slug']}) -> {item.get('postCount')} stories")
        assert "postCount" in item, "postCount field must be present in category response"

    # 3. View Category Articles modal query
    test_cat_id = 1 # Automotive
    status, articles = tester.test("Category Articles Modal Query", "GET", f"/api/v1/admin/posts?categoryId={test_cat_id}&size=50")
    posts = articles.get("data", {}).get("content", [])
    print(f"   Found {len(posts)} articles for category {test_cat_id}:")
    for p in posts:
        print(f"     * [{p['id']}] {p['title']}")
    assert len(posts) == 4, f"Expected 4 articles for category 1, got {len(posts)}"

    # 4. Get category detail
    status, detail = tester.test("Get Category Detail", "GET", f"/api/v1/admin/categories/{test_cat_id}")
    cat_data = detail.get("data", {})
    assert cat_data.get("name") == "Automotive & Accessories"
    assert cat_data.get("postCount") == 4

    # 5. Create category (CRUD)
    create_payload = {
        "name": "E-Bikes & Mobility",
        "slug": "e-bikes-mobility-test",
        "type": "post",
        "description": "Electric bicycles, scooters, and urban micromobility tech reviews.",
        "isActive": True,
        "showOnHome": True,
        "sortOrder": 15
    }
    status, created = tester.test("Create Category", "POST", "/api/v1/admin/categories", create_payload, expected_status=200)
    new_cat_id = created.get("data", {}).get("id")
    print(f"   Created category ID: {new_cat_id}")

    # 6. Update category (CRUD)
    update_payload = {
        "name": "E-Bikes & Urban Mobility",
        "slug": "e-bikes-urban-mobility-test",
        "type": "post",
        "description": "Updated electric bicycles and scooters reviews.",
        "isActive": True,
        "showOnHome": False,
        "sortOrder": 16
    }
    status, updated = tester.test("Update Category", "PUT", f"/api/v1/admin/categories/{new_cat_id}", update_payload)
    assert updated.get("data", {}).get("name") == "E-Bikes & Urban Mobility"

    # 7. Delete category (CRUD)
    status, deleted = tester.test("Delete Category", "DELETE", f"/api/v1/admin/categories/{new_cat_id}", expected_status=200)

    # 8. Verify category is deleted
    status, deleted_check = tester.test("Verify Deleted Category 404", "GET", f"/api/v1/admin/categories/{new_cat_id}", expected_status=404)

    # 9. Verify total count restored to 11
    status, cat_list_after = tester.test("List Categories After Delete", "GET", "/api/v1/admin/categories?size=20")
    total_after = cat_list_after.get("data", {}).get("totalElements")
    assert total_after == 11, f"Expected 11 total elements after delete, got {total_after}"

    print("=" * 60)
    passed = sum(1 for r in tester.results if r["success"])
    total = len(tester.results)
    print(f"CATEGORY SUITE SUMMARY: Total: {total} | Passed: {passed} | Failed: {total - passed}")
    print("=" * 60)

if __name__ == "__main__":
    run()
