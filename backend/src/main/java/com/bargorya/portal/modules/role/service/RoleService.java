package com.bargorya.portal.modules.role.service;

import com.bargorya.portal.modules.role.dto.request.RoleRequest;
import com.bargorya.portal.modules.role.dto.response.PermissionResponse;
import com.bargorya.portal.modules.role.dto.response.RoleResponse;

import java.util.List;
import java.util.Map;

public interface RoleService {
    List<RoleResponse> getAllRoles();
    RoleResponse getRoleById(Long id);
    RoleResponse createRole(RoleRequest request);
    RoleResponse updateRole(Long id, RoleRequest request);
    void deleteRole(Long id);
    List<PermissionResponse> getAllPermissions();
    Map<String, List<PermissionResponse>> getPermissionsGrouped();
}
