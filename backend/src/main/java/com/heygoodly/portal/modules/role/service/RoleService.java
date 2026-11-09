package com.heygoodly.portal.modules.role.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.role.dto.request.RoleRequest;
import com.heygoodly.portal.modules.role.dto.response.PermissionResponse;
import com.heygoodly.portal.modules.role.dto.response.RoleResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface RoleService {
    List<RoleResponse> getAllRoles();
    PageResponse<RoleResponse> getRoles(Pageable pageable, String search);
    RoleResponse getRoleById(Long id);
    RoleResponse createRole(RoleRequest request);
    RoleResponse updateRole(Long id, RoleRequest request);
    void deleteRole(Long id);
    List<PermissionResponse> getAllPermissions();
    Map<String, List<PermissionResponse>> getPermissionsGrouped();
}
