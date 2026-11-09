package com.heygoodly.portal.modules.role.mapper;

import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.modules.role.dto.response.PermissionResponse;
import com.heygoodly.portal.modules.role.dto.response.RoleResponse;
import com.heygoodly.portal.modules.role.entity.PermissionEntity;
import com.heygoodly.portal.modules.role.entity.RoleEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Dedicated mapper for RBAC Roles and Permissions.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
public class RoleMapper implements BaseMapper<RoleEntity, RoleResponse, RoleResponse> {

    @Override
    public RoleResponse toDetailResponse(RoleEntity role) {
        return toRoleResponse(role, 0L);
    }

    @Override
    public RoleResponse toSummaryResponse(RoleEntity role) {
        return toDetailResponse(role);
    }

    public RoleResponse toRoleResponse(RoleEntity role, long userCount) {
        if (Objects.isNull(role)) {
            return null;
        }

        List<String> permissionCodes = Objects.nonNull(role.getPermissions())
                ? role.getPermissions().stream().map(PermissionEntity::getCode).sorted().collect(Collectors.toList())
                : Collections.emptyList();

        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getSlug(),
                role.getDescription(),
                Boolean.TRUE.equals(role.getIsSystem()),
                userCount,
                permissionCodes
        );
    }

    public PermissionResponse toPermissionResponse(PermissionEntity entity) {
        if (Objects.isNull(entity)) {
            return null;
        }

        return new PermissionResponse(
                entity.getId(),
                entity.getModule(),
                entity.getAction(),
                entity.getCode(),
                entity.getName(),
                entity.getDescription()
        );
    }
}

