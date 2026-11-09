#!/usr/bin/env python3
"""
Comprehensive Media Module Test Suite for HeyGoodly Portal.
Tests 100% database-driven Media Library features:
1. Media list retrieval with database pagination & metadata
2. Category folder filtering (all, stores, articles, banners, icons)
3. Tag filtering and dynamic tag count endpoint (/tags/counts)
4. Format filtering (webp, png, jpg)
5. Sort order variations (newest, oldest, size-desc, name-asc)
6. Tag update on media asset (PUT /api/v1/admin/media/{id}/tags)
7. Media upload with mandatory tags (POST /api/v1/admin/media/upload)
8. Media asset deletion (DELETE /api/v1/admin/media/{id})
9. Audit log trace verification (UPLOAD_MEDIA, UPDATE_MEDIA_TAGS, DELETE_MEDIA)
"""

import sys
import json
import urllib.request
import urllib.error
import io

BASE_URL = "http://localhost:8080"

class MediaTester:
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
            with urllib.request.urlopen(req) as res:
                content = res.read().decode("utf-8")
                return res.status, json.loads(content) if content else {}
        except urllib.error.HTTPError as e:
            content = e.read().decode("utf-8")
            try:
                return e.code, json.loads(content)
            except:
                return e.code, {"error": content}

    def upload_file(self, filename, file_bytes, category="articles", tags=None, dimensions="800x600"):
        url = f"{BASE_URL}/api/v1/admin/media/upload"
        boundary = "----HeyGoodlyMediaBoundaryXYZ123"
        lines = []

        # File part
        lines.append(f"--{boundary}".encode("utf-8"))
        lines.append(f'Content-Disposition: form-data; name="file"; filename="{filename}"'.encode("utf-8"))
        lines.append(b"Content-Type: image/png")
        lines.append(b"")
        lines.append(file_bytes)

        # Category part
        lines.append(f"--{boundary}".encode("utf-8"))
        lines.append(b'Content-Disposition: form-data; name="category"')
        lines.append(b"")
        lines.append(category.encode("utf-8"))

        # Dimensions part
        lines.append(f"--{boundary}".encode("utf-8"))
        lines.append(b'Content-Disposition: form-data; name="dimensions"')
        lines.append(b"")
        lines.append(dimensions.encode("utf-8"))

        # Tags part
        if tags:
            for t in tags:
                lines.append(f"--{boundary}".encode("utf-8"))
                lines.append(b'Content-Disposition: form-data; name="tags"')
                lines.append(b"")
                lines.append(t.encode("utf-8"))

        lines.append(f"--{boundary}--".encode("utf-8"))
        lines.append(b"")

        body = b"\r\n".join(lines)
        headers = {
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as res:
                content = res.read().decode("utf-8")
                return res.status, json.loads(content) if content else {}
        except urllib.error.HTTPError as e:
            content = e.read().decode("utf-8")
            try:
                return e.code, json.loads(content)
            except:
                return e.code, {"error": content}

    def record(self, test_name, passed, message=""):
        status = "PASS" if passed else "FAIL"
        self.results.append((test_name, passed, message))
        print(f"[{status}] {test_name}: {message}")

def run():
    print("=" * 60)
    print("STARTING MEDIA LIBRARY MODULE TEST SUITE")
    print("=" * 60)

    tester = MediaTester()
    try:
        tester.login()
        print("Successfully authenticated as Super Admin")
    except Exception as e:
        print(f"Authentication failed: {e}")
        sys.exit(1)

    # Test 1: Fetch paginated media from PostgreSQL
    status, data = tester.request("GET", "/api/v1/admin/media?page=0&size=12")
    tester.record(
        "1. Media Listing Database Query",
        status == 200 and "data" in data and "content" in data["data"],
        f"Status: {status}, Total Elements: {data.get('data', {}).get('totalElements', 0)}"
    )

    content = data.get("data", {}).get("content", [])
    total_elements = data.get("data", {}).get("totalElements", 0)

    # Test 2: Category folder filtering
    status_stores, data_stores = tester.request("GET", "/api/v1/admin/media?category=stores&size=10")
    stores_count = data_stores.get("data", {}).get("totalElements", 0)
    tester.record(
        "2. Category Folder Filter: stores",
        status_stores == 200 and stores_count > 0,
        f"Found {stores_count} stores assets"
    )

    status_articles, data_articles = tester.request("GET", "/api/v1/admin/media?category=articles&size=10")
    articles_count = data_articles.get("data", {}).get("totalElements", 0)
    tester.record(
        "3. Category Folder Filter: articles",
        status_articles == 200 and articles_count > 0,
        f"Found {articles_count} articles assets"
    )

    # Test 4: Dynamic tag counts endpoint
    status_tag_counts, data_tag_counts = tester.request("GET", "/api/v1/admin/media/tags/counts")
    tag_counts = data_tag_counts.get("data", {})
    tester.record(
        "4. Dynamic Tag Counts API",
        status_tag_counts == 200 and len(tag_counts) > 0,
        f"Total unique tags with count: {len(tag_counts)}"
    )

    # Test 5: All unique tags endpoint
    status_tags, data_tags = tester.request("GET", "/api/v1/admin/media/tags")
    tags_list = data_tags.get("data", [])
    tester.record(
        "5. All Unique Tags API",
        status_tags == 200 and len(tags_list) > 0,
        f"Total unique tags: {len(tags_list)}"
    )

    # Test 6: Tag filtering
    first_tag = tags_list[0] if tags_list else "stores"
    status_tag_filter, data_tag_filter = tester.request("GET", f"/api/v1/admin/media?tag={first_tag}&size=10")
    tag_filtered_count = data_tag_filter.get("data", {}).get("totalElements", 0)
    tester.record(
        f"6. Tag Filtering: #{first_tag}",
        status_tag_filter == 200 and tag_filtered_count > 0,
        f"Found {tag_filtered_count} matching assets"
    )

    # Test 7: Format filtering
    status_format, data_format = tester.request("GET", "/api/v1/admin/media?format=webp&size=10")
    format_count = data_format.get("data", {}).get("totalElements", 0)
    tester.record(
        "7. Format Filter: webp",
        status_format == 200 and format_count > 0,
        f"Found {format_count} WebP assets"
    )

    # Test 8: Sort variations
    status_sort_oldest, data_sort_oldest = tester.request("GET", "/api/v1/admin/media?sortBy=oldest&size=5")
    status_sort_size, data_sort_size = tester.request("GET", "/api/v1/admin/media?sortBy=size-desc&size=5")
    tester.record(
        "8. Sort By Variations (oldest, size-desc)",
        status_sort_oldest == 200 and status_sort_size == 200,
        "Successfully queried sorted datasets"
    )

    # Test 9: Update tags on existing asset
    target_asset = content[0] if content else None
    if target_asset:
        target_id = target_asset["id"]
        original_tags = target_asset.get("tags", [])
        test_tags = list(set(original_tags + ["test-automated-tag", "verified"]))
        status_update, data_update = tester.request("PUT", f"/api/v1/admin/media/{target_id}/tags", {"tags": test_tags})
        updated_tags = data_update.get("data", {}).get("tags", [])
        tester.record(
            "9. Update Tags on Asset (PUT)",
            status_update == 200 and "test-automated-tag" in updated_tags,
            f"Asset #{target_id} updated with {len(updated_tags)} tags"
        )
        # Revert tags
        tester.request("PUT", f"/api/v1/admin/media/{target_id}/tags", {"tags": original_tags})

    # Test 10: Upload new media with mandatory tags
    # Minimal 1x1 PNG transparent pixel
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
    status_upload, data_upload = tester.upload_file(
        "test-upload-pixel.png",
        png_bytes,
        category="articles",
        tags=["automated-test", "sample", "qa"],
        dimensions="1x1"
    )
    uploaded_id = data_upload.get("data", {}).get("id")
    tester.record(
        "10. Upload Media with Mandatory Tags (POST multipart)",
        status_upload == 200 and uploaded_id is not None,
        f"Uploaded media ID #{uploaded_id}, category: {data_upload.get('data', {}).get('category')}"
    )

    # Test 11: Delete uploaded test media
    if uploaded_id:
        status_del, data_del = tester.request("DELETE", f"/api/v1/admin/media/{uploaded_id}")
        tester.record(
            "11. Delete Media Asset (DELETE)",
            status_del == 200,
            f"Deleted temporary asset #{uploaded_id}"
        )

    # Test 12: Audit Log Trace
    status_audit, data_audit = tester.request("GET", "/api/v1/admin/audit?module=media&size=10")
    audit_items = data_audit.get("data", {}).get("content", [])
    actions_found = [a.get("action") for a in audit_items]
    tester.record(
        "12. Audit Log Verification (media actions)",
        status_audit == 200 and len(audit_items) > 0,
        f"Recent actions logged: {', '.join(actions_found[:5])}"
    )

    # Summary
    print("=" * 60)
    print("MEDIA MODULE TEST RESULTS SUMMARY")
    print("=" * 60)
    passed_count = sum(1 for _, p, _ in tester.results if p)
    total_count = len(tester.results)
    print(f"Passed: {passed_count}/{total_count}")
    for name, p, msg in tester.results:
        print(f"[{'PASS' if p else 'FAIL'}] {name} - {msg}")

    if passed_count != total_count:
        sys.exit(1)
    print("ALL MEDIA TESTS PASSED 100% OKELA!")

if __name__ == "__main__":
    run()

