#!/usr/bin/env python3
"""
Comprehensive Post & Article Module Test Suite for HeyGoodly Portal.
Tests 100% database-driven Editorial Articles & Reviews:
1. Global Post Stats (/api/v1/admin/posts/stats)
2. List articles with pagination and default sort
3. Filter by Category (categoryId)
4. Filter by Status (PUBLISHED, SCHEDULED, DRAFT)
5. Filter by Featured Editor Picks (featured=true)
6. Search by headline / keyword / slug
7. Sort by highest views and title A-Z
8. Get article detail (/api/v1/admin/posts/{id})
9. Create new article (CRUD - Create)
10. Update article (CRUD - Update)
11. Clone article as draft copy
12. Verify stats reflect new draft post
13. Delete article (CRUD - Delete)
14. Verify stats restored
15. Public article detail
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080"

class PostTester:
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
    tester = PostTester()
    print("=" * 60)
    print("STARTING EDITORIAL POSTS & ARTICLES TEST SUITE")
    print("=" * 60)

    tester.login()
    print("Authenticated successfully.")

    # 1. Global Post Stats
    status, res = tester.test("Get Admin Post Stats", "GET", "/api/v1/admin/posts/stats")
    stats = res.get("data", {})
    print(f"   Stats: Total={stats.get('total')}, Published={stats.get('published')}, Scheduled={stats.get('scheduled')}, Draft={stats.get('draft')}, Views={stats.get('totalViews')}")
    assert stats.get("total") >= 18, f"Expected at least 18 total posts, got {stats.get('total')}"
    initial_total = stats.get("total")
    initial_draft = stats.get("draft")

    # 2. List posts
    status, res = tester.test("List Admin Posts Page 0 Size 8", "GET", "/api/v1/admin/posts?page=0&size=8")
    items = res.get("data", {}).get("content", [])
    assert len(items) == 8, f"Expected 8 items on page 0, got {len(items)}"
    print(f"   Loaded {len(items)} articles on page 0.")

    # 3. Category Filter
    status, res = tester.test("Filter by Category (Cat ID=1 Automotive)", "GET", "/api/v1/admin/posts?categoryId=1")
    cat1_posts = res.get("data", {}).get("content", [])
    assert len(cat1_posts) == 4, f"Expected 4 articles for category 1, got {len(cat1_posts)}"
    for p in cat1_posts:
        assert p.get("categoryId") == 1, f"Post {p['id']} categoryId is {p.get('categoryId')}, expected 1"
    print(f"   Category 1 correctly returned {len(cat1_posts)} articles.")

    # 4. Status Filter
    status, res = tester.test("Filter by Status: PUBLISHED", "GET", "/api/v1/admin/posts?status=PUBLISHED")
    pub_posts = res.get("data", {}).get("content", [])
    for p in pub_posts:
        assert p.get("status") == "PUBLISHED"

    # 5. Featured Highlights Filter
    status, res = tester.test("Filter by Featured: featured=true", "GET", "/api/v1/admin/posts?featured=true")
    featured_posts = res.get("data", {}).get("content", [])
    assert len(featured_posts) > 0, "Expected at least 1 featured post"
    for p in featured_posts:
        assert p.get("isFeatured") is True, f"Post {p['id']} is not featured"
    print(f"   Found {len(featured_posts)} featured editor picks.")

    # 6. Search
    status, res = tester.test("Search by Keyword 'Nilight'", "GET", "/api/v1/admin/posts?search=Nilight")
    search_posts = res.get("data", {}).get("content", [])
    assert len(search_posts) >= 2, f"Expected at least 2 Nilight articles, got {len(search_posts)}"

    # 7. Sort by highest views
    status, res = tester.test("Sort by Highest Views", "GET", "/api/v1/admin/posts?sortBy=viewCount&direction=desc&size=5")
    views_posts = res.get("data", {}).get("content", [])
    for i in range(len(views_posts) - 1):
        assert views_posts[i]["viewCount"] >= views_posts[i+1]["viewCount"], "Views sorting descending order violation"
    print(f"   Top view post: [{views_posts[0]['id']}] {views_posts[0]['title']} ({views_posts[0]['viewCount']} views)")

    # 8. Sort by Title A-Z
    status, res = tester.test("Sort by Title A-Z", "GET", "/api/v1/admin/posts?sortBy=title&direction=asc&size=5")
    title_posts = res.get("data", {}).get("content", [])
    print(f"   First alphabetical post: [{title_posts[0]['id']}] {title_posts[0]['title']}")

    # 9. Get Post Detail
    status, res = tester.test("Get Post Detail (ID=1)", "GET", "/api/v1/admin/posts/1")
    detail = res.get("data", {})
    assert detail.get("id") == 1
    assert detail.get("categoryId") == 1
    assert "content" in detail

    # 10. Create new Article (CRUD - Create)
    create_payload = {
        "title": "Anker Soundcore Space One Pro In-Depth Noise Cancellation Benchmark (2026)",
        "slug": "anker-space-one-pro-anc-benchmark-2026-test",
        "categoryId": 2, # Electronics & Gadgets
        "image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
        "excerpt": "Testing the latest 4-stage noise reduction architecture under heavy public transit environments.",
        "content": "<h2>ANC Performance Tests</h2><p>Our lab testing demonstrates significant low-frequency attenuation...</p>",
        "isFeatured": True,
        "isActive": True,
        "status": "PUBLISHED"
    }
    status, res = tester.test("Create Article", "POST", "/api/v1/admin/posts", create_payload, expected_status=200)
    new_post_id = res.get("data", {}).get("id")
    print(f"   Created article ID: {new_post_id}")
    assert res.get("data", {}).get("categoryId") == 2

    # 11. Update Article (CRUD - Update)
    update_payload = {
        "title": "Anker Soundcore Space One Pro In-Depth ANC Benchmark & Lab Scores (2026)",
        "slug": "anker-space-one-pro-anc-benchmark-2026-test",
        "categoryId": 6, # Move to Technology & Gear
        "image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
        "excerpt": "Updated with 40-hour battery benchmark results and LDAC frequency response.",
        "content": "<h2>Lab Scores & Metrics</h2><p>Frequency tests confirm exceptional accuracy in LDAC high-res mode.</p>",
        "isFeatured": False,
        "isActive": True,
        "status": "PUBLISHED"
    }
    status, res = tester.test("Update Article", "PUT", f"/api/v1/admin/posts/{new_post_id}", update_payload)
    assert res.get("data", {}).get("categoryId") == 6
    assert "Lab Scores" in res.get("data", {}).get("title")

    # 12. Clone Article as Draft Copy
    status, res = tester.test("Clone Article", "POST", f"/api/v1/admin/posts/{new_post_id}/clone", expected_status=200)
    clone_id = res.get("data", {}).get("id")
    print(f"   Cloned article ID: {clone_id}, Status: {res.get('data', {}).get('status')}")
    assert res.get("data", {}).get("status") == "DRAFT"

    # 13. Verify stats reflect new draft post
    status, res = tester.test("Verify Stats After Clone", "GET", "/api/v1/admin/posts/stats")
    stats_after_clone = res.get("data", {})
    assert stats_after_clone.get("draft") == initial_draft + 1
    assert stats_after_clone.get("total") == initial_total + 2

    # 14. Delete Cloned Post
    status, res = tester.test("Delete Cloned Article", "DELETE", f"/api/v1/admin/posts/{clone_id}")

    # 15. Delete Test Post
    status, res = tester.test("Delete Created Article", "DELETE", f"/api/v1/admin/posts/{new_post_id}")

    # 16. Verify Deleted 404
    status, res = tester.test("Verify Deleted Article 404", "GET", f"/api/v1/admin/posts/{new_post_id}", expected_status=404)

    # 17. Verify stats restored
    status, res = tester.test("Verify Stats Restored", "GET", "/api/v1/admin/posts/stats")
    stats_restored = res.get("data", {})
    assert stats_restored.get("total") == initial_total
    assert stats_restored.get("draft") == initial_draft

    # 18. Public Client Post Detail
    status, res = tester.test("Public Client Post Detail (slug=nilight-led-light-bar-review)", "GET", "/api/v1/public/posts/nilight-led-light-bar-review")
    pub_detail = res.get("data", {})
    assert pub_detail.get("slug") == "nilight-led-light-bar-review"

    print("=" * 60)
    passed = sum(1 for r in tester.results if r["success"])
    total = len(tester.results)
    print(f"POSTS SUITE SUMMARY: Total: {total} | Passed: {passed} | Failed: {total - passed}")
    print("=" * 60)

if __name__ == "__main__":
    run()
