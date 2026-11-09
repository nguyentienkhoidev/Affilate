#!/usr/bin/env python3
"""
Dynamic RBAC & Permission Matrix Verification Test Suite.
Tests that:
1. Super Administrator role is locked and cannot be modified.
2. Staff role permissions can be modified and saved.
3. Custom roles can be created, updated, and deleted.
4. Built-in system roles (admin, staff) cannot be deleted.
5. Granular permission enforcement works (403 Forbidden vs 200 OK).
"""

import urllib.request
import urllib.error
import json
import sys

BASE = 'http://localhost:8080'

def req(method, path, data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    body = json.dumps(data).encode('utf-8') if data else None
    r = urllib.request.Request(f'{BASE}{path}', data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.getcode(), json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except:
            return e.code, {}

def run_tests():
    print("=" * 60)
    print("STARTING DYNAMIC RBAC PERMISSION VERIFICATION TEST SUITE")
    print("=" * 60)

    # 1. Login Admin
    _, lres = req('POST', '/api/v1/auth/login', {'email': 'admin@heygoodly.com', 'password': 'Admin@123456'})
    temp = lres['data']['tempToken']
    _, vres = req('POST', '/api/v1/auth/verify-2fa', {'tempToken': temp, 'otpCode': 884219})
    admin_token = vres['data']['accessToken']
    print('✅ Super Admin Token Acquired')

    # Case 1: Try modifying Admin role (ID 1)
    c1_status, c1_res = req('PUT', '/api/v1/admin/roles/1', {'name': 'Administrator', 'slug': 'admin', 'permissions': ['backend.access']}, token=admin_token)
    print(f'{"✅" if c1_status == 400 else "❌"} [Case 1] Modify Admin Role: {c1_status} ({c1_res.get("message")})')
    assert c1_status == 400, f'Expected 400 but got {c1_status}'

    # Case 2: Modify Staff role (ID 2)
    c2_status, c2_res = req('PUT', '/api/v1/admin/roles/2', {
        'name': 'Staff',
        'slug': 'staff',
        'description': 'Operational staff role updated',
        'permissions': ['backend.access', 'user.2fa_self', 'file.upload', 'post.view', 'store.view', 'store.create', 'category.view']
    }, token=admin_token)
    print(f'{"✅" if c2_status == 200 else "❌"} [Case 2] Modify Staff Role: {c2_status} (Perms count: {len(c2_res.get("data", {}).get("permissions", []))})')
    assert c2_status == 200, f'Expected 200 but got {c2_status}'

    # Restore Staff standard permissions
    req('PUT', '/api/v1/admin/roles/2', {
        'name': 'Staff',
        'slug': 'staff',
        'description': 'Default operational staff role for content and deals management',
        'permissions': [
            'backend.access', 'category.view', 'file.upload', 'offer.clone',
            'offer.create', 'offer.update', 'offer.verify', 'offer.view',
            'post.clone', 'post.create', 'post.publish', 'post.update', 'post.view',
            'store.create', 'store.update', 'store.view', 'user.2fa_self'
        ]
    }, token=admin_token)
    print('   -> Restored baseline operational perms for Staff')

    # Case 3: Create, Update, Delete Custom Role
    c3_status, c3_create = req('POST', '/api/v1/admin/roles', {
        'name': 'QA Auditor Role',
        'slug': 'qa-auditor',
        'description': 'Temporary testing role',
        'permissions': ['backend.access', 'user.2fa_self', 'store.view']
    }, token=admin_token)
    custom_id = c3_create.get('data', {}).get('id')
    print(f'{"✅" if c3_status == 201 else "❌"} [Case 3a] Create Custom Role: {c3_status} (ID: {custom_id})')
    assert c3_status == 201, f'Expected 201 but got {c3_status}'

    c3b_status, c3b_update = req('PUT', f'/api/v1/admin/roles/{custom_id}', {
        'name': 'QA Auditor Role',
        'slug': 'qa-auditor',
        'description': 'Updated QA role',
        'permissions': ['backend.access', 'user.2fa_self', 'store.view', 'offer.view']
    }, token=admin_token)
    print(f'{"✅" if c3b_status == 200 else "❌"} [Case 3b] Update Custom Role: {c3b_status} (New perms: {len(c3b_update.get("data", {}).get("permissions", []))})')
    assert c3b_status == 200

    c3c_status, _ = req('DELETE', f'/api/v1/admin/roles/{custom_id}', token=admin_token)
    print(f'{"✅" if c3c_status == 200 else "❌"} [Case 3c] Delete Custom Role: {c3c_status}')
    assert c3c_status == 200

    # Case 4: Delete System Roles Protection
    c4a_status, c4a_res = req('DELETE', '/api/v1/admin/roles/1', token=admin_token)
    print(f'{"✅" if c4a_status == 400 else "❌"} [Case 4a] Delete Admin (Protected): {c4a_status} ({c4a_res.get("message")})')
    assert c4a_status == 400

    c4b_status, c4b_res = req('DELETE', '/api/v1/admin/roles/2', token=admin_token)
    print(f'{"✅" if c4b_status == 400 else "❌"} [Case 4b] Delete Staff (Protected): {c4b_status} ({c4b_res.get("message")})')
    assert c4b_status == 400

    # Case 5: Staff User Authorization Check (Sarah Jenkins)
    _, s_login = req('POST', '/api/v1/auth/login', {'email': 'sarah@heygoodly.com', 'password': 'HeyGoodly@2026'})
    if s_login.get('data', {}).get('requiresTwoFactor'):
        s_temp = s_login['data']['tempToken']
        _, s_v2fa = req('POST', '/api/v1/auth/verify-2fa', {'tempToken': s_temp, 'otpCode': 884219})
        sarah_token = s_v2fa.get('data', {}).get('accessToken')
    else:
        sarah_token = s_login.get('data', {}).get('accessToken')

    print(f'✅ Sarah (Staff) Token Acquired: {bool(sarah_token)}')

    # Sarah tries to create a role (Staff does NOT have role.create)
    s_role_create_status, _ = req('POST', '/api/v1/admin/roles', {'name': 'Hacker Role'}, token=sarah_token)
    print(f'{"✅" if s_role_create_status == 403 else "❌"} [Case 5a] Staff Access Forbidden (role.create): {s_role_create_status}')
    assert s_role_create_status == 403

    # Sarah tries to update general settings (Staff does NOT have setting.general)
    s_set_status, _ = req('PUT', '/api/v1/admin/settings', {'settings': {'site_name': 'Hacked'}}, token=sarah_token)
    print(f'{"✅" if s_set_status == 403 else "❌"} [Case 5b] Staff Access Forbidden (setting.general): {s_set_status}')
    assert s_set_status == 403

    # Sarah tries to delete a store (Staff does NOT have store.delete)
    s_store_del_status, _ = req('DELETE', '/api/v1/admin/stores/1', token=sarah_token)
    print(f'{"✅" if s_store_del_status == 403 else "❌"} [Case 5c] Staff Access Forbidden (store.delete): {s_store_del_status}')
    assert s_store_del_status == 403

    # Sarah accesses stores (Staff HAS store.view)
    s_store_status, s_store_res = req('GET', '/api/v1/admin/stores?page=0&size=2', token=sarah_token)
    items_count = len(s_store_res.get('data', {}).get('content', []))
    print(f'{"✅" if s_store_status == 200 else "❌"} [Case 5d] Staff Access Permitted (store.view): {s_store_status} ({items_count} items)')
    assert s_store_status == 200

    # Sarah accesses posts (Staff HAS post.view)
    s_post_status, s_post_res = req('GET', '/api/v1/admin/posts?page=0&size=2', token=sarah_token)
    posts_count = len(s_post_res.get('data', {}).get('content', []))
    print(f'{"✅" if s_post_status == 200 else "❌"} [Case 5e] Staff Access Permitted (post.view): {s_post_status} ({posts_count} items)')
    assert s_post_status == 200

    print("\n" + "=" * 60)
    print("🎉 ALL 5 RBAC & PERMISSION ENFORCEMENT TEST CASES PASSED (100%)")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()

