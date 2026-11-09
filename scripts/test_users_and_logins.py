import urllib.request
import urllib.error
import json
import sys
import time

BASE_URL = "http://localhost:8080/api/v1"

def request(method, path, data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else None
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(res_body)
        except Exception:
            return e.code, {"message": res_body}

def run_tests():
    print("=== Testing Staff Accounts & Login Trace APIs ===")
    
    # 1. Login as Super Admin
    status, res = request("POST", "/auth/login", {
        "email": "admin@heygoodly.com",
        "password": "Admin@123456"
    })
    assert status == 200, f"Login failed: {status} {res}"
    
    data = res.get("data", {})
    if data.get("requiresTwoFactor"):
        print("   2FA required. Submitting 2FA verification...")
        status, v_res = request("POST", "/auth/verify-2fa", {
            "tempToken": data.get("tempToken"),
            "otpCode": 884219
        })
        assert status == 200, f"Verify 2FA failed: {v_res}"
        token = v_res["data"]["accessToken"]
    else:
        token = data["accessToken"]

    print("1. Admin sign-in successful -> Access token acquired.")

    # 2. List Users with Pagination and Filters
    status, res = request("GET", "/admin/users?page=0&size=10", token=token)
    assert status == 200, f"List users failed: {res}"
    users = res["data"].get("content") or res["data"].get("items") or []
    print(f"2. List users -> Found {len(users)} users. Total: {res['data']['totalElements']}")
    assert len(users) >= 1, "At least 1 user should exist"
    
    # Check UserResponse structure
    u0 = users[0]
    print(f"   Sample user: ID={u0['id']}, Name='{u0['fullName']}', Role='{u0.get('roleName')}', Logins={u0.get('loginCount')}")
    assert "roleName" in u0, "roleName field missing from UserResponse"
    assert "lastLoginAt" in u0, "lastLoginAt field missing from UserResponse"
    assert "loginCount" in u0, "loginCount field missing from UserResponse"

    # Test filtering by isActive=true
    status, res = request("GET", "/admin/users?isActive=true", token=token)
    assert status == 200, f"Filter active users failed: {res}"
    active_users = res["data"].get("content") or res["data"].get("items") or []
    print(f"   Active users filter -> {len(active_users)} records")

    # 3. Create a New Staff User
    test_email = f"test.editor.{int(time.time())}@heygoodly.com"
    create_payload = {
        "fullName": "QA Test Editor",
        "email": test_email,
        "password": "Password123!",
        "roleName": "Staff",
        "isActive": True,
        "phone": "+1 (555) 019-2834",
        "department": "Automated Testing",
        "timezone": "America/New_York (EST / UTC-5)",
        "bio": "Experienced editorial QA specialist for testing automation.",
        "socialX": "https://x.com/qaeditor",
        "socialLinkedIn": "https://linkedin.com/in/qaeditor"
    }
    status, res = request("POST", "/admin/users", create_payload, token=token)
    assert status == 201, f"Create user failed: {status} {res}"
    created_user = res["data"]
    user_id = created_user["id"]
    print(f"3. Create user -> Success: ID={user_id}, Name='{created_user['fullName']}'")

    # 4. Update the User Profile
    update_payload = {
        "fullName": "QA Senior Test Editor",
        "email": test_email,
        "roleName": "Staff",
        "isActive": True,
        "phone": "+1 (555) 999-8888",
        "department": "Lead Editorial QA",
        "timezone": "Europe/London (GMT / UTC+0)",
        "bio": "Senior Lead QA Engineer for affiliate portal.",
        "socialX": "https://x.com/qasenioreditor",
        "socialLinkedIn": "https://linkedin.com/in/qasenioreditor"
    }
    status, res = request("PUT", f"/admin/users/{user_id}", update_payload, token=token)
    assert status == 200, f"Update user failed: {res}"
    assert res["data"]["fullName"] == "QA Senior Test Editor"
    assert res["data"]["phone"] == "+1 (555) 999-8888"
    print("4. Update user profile -> Verified updated name and phone.")

    # 5. Toggle Status (Active -> Inactive -> Active)
    status, res = request("PATCH", f"/admin/users/{user_id}/status", {"isActive": False}, token=token)
    assert status == 200, f"Toggle inactive failed: {res}"
    status, res = request("GET", f"/admin/users/{user_id}", token=token)
    assert res["data"]["isActive"] is False
    print("5a. Toggle status to Inactive -> Verified user.isActive is False.")

    status, res = request("PATCH", f"/admin/users/{user_id}/status", {"isActive": True}, token=token)
    assert status == 200, f"Toggle active failed: {res}"
    status, res = request("GET", f"/admin/users/{user_id}", token=token)
    assert res["data"]["isActive"] is True
    print("5b. Toggle status back to Active -> Verified user.isActive is True.")

    # 6. Reset 2FA
    status, res = request("POST", f"/admin/users/{user_id}/reset-2fa", token=token)
    assert status == 200, f"Reset 2FA failed: {res}"
    print("6. Reset 2FA -> Success.")

    # 7. Login History: Initial Empty Check
    status, res = request("GET", f"/admin/users/{user_id}/logins", token=token)
    assert status == 200, f"Get logins failed: {res}"
    assert len(res["data"]) == 0, f"New user should have 0 login records: {res}"
    print("7. Initial login history -> Verified empty list (0 records).")

    # 8. Add First Login Record
    record_1 = {
        "ipAddress": "103.20.144.10",
        "location": "Ho Chi Minh City, VN",
        "device": "Chrome 130 • macOS Sequoia",
        "authMethod": "Password",
        "status": "Success",
        "duration": "Active now"
    }
    status, res = request("POST", f"/admin/users/{user_id}/logins", record_1, token=token)
    assert status == 201, f"Add login record 1 failed: {res}"
    r1_id = res["data"]["id"]
    print(f"8. Add login record 1 -> Created record ID={r1_id}, IP='{res['data']['ipAddress']}'")

    # Verify user stats updated
    status, res = request("GET", f"/admin/users/{user_id}", token=token)
    assert res["data"]["loginCount"] == 1
    assert res["data"]["lastLoginIp"] == "103.20.144.10"
    print(f"   Verified user stats updated: loginCount={res['data']['loginCount']}, lastLoginIp='{res['data']['lastLoginIp']}'")

    # 9. Update / Edit Login Record 1
    update_r1 = {
        "ipAddress": "103.20.144.10",
        "location": "District 1, Ho Chi Minh City, VN",
        "device": "Safari 18 • macOS",
        "authMethod": "2FA (TOTP)",
        "status": "Success",
        "duration": "45m"
    }
    status, res = request("PUT", f"/admin/users/{user_id}/logins/{r1_id}", update_r1, token=token)
    assert status == 200, f"Update login record failed: {res}"
    assert res["data"]["device"] == "macOS" or "Safari" in res["data"]["device"]
    assert res["data"]["location"] == "District 1, Ho Chi Minh City, VN"
    print("9. Edit login record 1 -> Verified updated device & location.")

    # 10. Add Second Login Record
    record_2 = {
        "ipAddress": "14.161.20.5",
        "location": "Da Nang, VN",
        "device": "Firefox 131 • Windows 11",
        "authMethod": "Password",
        "status": "Success",
        "duration": "12m"
    }
    status, res = request("POST", f"/admin/users/{user_id}/logins", record_2, token=token)
    assert status == 201, f"Add login record 2 failed: {res}"
    r2_id = res["data"]["id"]
    print(f"10. Add login record 2 -> Created record ID={r2_id}")

    # Check total logins is now 2
    status, res = request("GET", f"/admin/users/{user_id}/logins", token=token)
    assert len(res["data"]) == 2
    print(f"    Get logins -> Verified 2 records exist.")

    # 11. Delete Single Login Record (r1)
    status, res = request("DELETE", f"/admin/users/{user_id}/logins/{r1_id}", token=token)
    assert status == 200, f"Delete record 1 failed: {res}"
    print(f"11. Delete login record ID={r1_id} -> Success.")

    # Check 1 remaining
    status, res = request("GET", f"/admin/users/{user_id}/logins", token=token)
    assert len(res["data"]) == 1
    assert res["data"][0]["id"] == r2_id
    print(f"    Verified only record ID={r2_id} remains.")

    # 12. Clear All Login Records
    status, res = request("DELETE", f"/admin/users/{user_id}/logins", token=token)
    assert status == 200, f"Clear all logins failed: {res}"
    print("12. Clear all login records -> Success.")

    # Check 0 remaining
    status, res = request("GET", f"/admin/users/{user_id}/logins", token=token)
    assert len(res["data"]) == 0
    print("    Verified login records list is completely cleared (0 records).")

    # 13. Delete the Test User
    status, res = request("DELETE", f"/admin/users/{user_id}", token=token)
    assert status == 200, f"Delete user failed: {res}"
    print(f"13. Delete staff user ID={user_id} -> Successfully deleted.")

    print("\nALL STAFF ACCOUNTS & LOGIN TRACE TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_tests()
