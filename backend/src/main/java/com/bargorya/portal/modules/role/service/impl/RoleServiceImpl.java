package com.bargorya.portal.modules.role.service.impl;

import com.bargorya.portal.common.exception.BadRequestException;
import com.bargorya.portal.common.exception.DuplicateResourceException;
import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.common.util.SlugUtils;
import com.bargorya.portal.modules.role.dto.request.RoleRequest;
import com.bargorya.portal.modules.role.dto.response.PermissionResponse;
import com.bargorya.portal.modules.role.dto.response.RoleResponse;
import com.bargorya.portal.modules.role.entity.PermissionEntity;
import com.bargorya.portal.modules.role.entity.RoleEntity;
import com.bargorya.portal.modules.role.repository.PermissionRepository;
import com.bargorya.portal.modules.role.repository.RoleRepository;
import com.bargorya.portal.modules.role.service.RoleService;
import com.bargorya.portal.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        RoleEntity role = roleRepository.findWithPermissionsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
        return mapToRoleResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getName());

        if (roleRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("Role with slug '" + slug + "' already exists.");
        }

        Set<PermissionEntity> permissions = resolvePermissions(request.getPermissions());

        RoleEntity role = RoleEntity.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .isSystem(false)
                .permissions(permissions)
                .build();

        RoleEntity saved = roleRepository.save(role);
        return mapToRoleResponse(saved);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, RoleRequest request) {
        RoleEntity role = roleRepository.findWithPermissionsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));

        if (Boolean.TRUE.equals(role.getIsSystem())) {
            // System roles (admin, staff) cannot change slug or be demoted
            role.setDescription(request.getDescription());
        } else {
            role.setName(request.getName());
            if (request.getSlug() != null && !request.getSlug().isBlank()) {
                String newSlug = SlugUtils.toSlug(request.getSlug());
                if (!newSlug.equals(role.getSlug()) && roleRepository.existsBySlug(newSlug)) {
                    throw new DuplicateResourceException("Role with slug '" + newSlug + "' already exists.");
                }
                role.setSlug(newSlug);
            }
            role.setDescription(request.getDescription());
        }

        if (request.getPermissions() != null) {
            role.setPermissions(resolvePermissions(request.getPermissions()));
        }

        RoleEntity updated = roleRepository.save(role);
        return mapToRoleResponse(updated);
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));

        if (Boolean.TRUE.equals(role.getIsSystem())) {
            throw new BadRequestException("System roles cannot be deleted.");
        }

        long userCount = userRepository.countByRoleIdAndIsDeletedFalse(id);
        if (userCount > 0) {
            throw new BadRequestException("Cannot delete role assigned to " + userCount + " active user(s).");
        }

        roleRepository.delete(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<PermissionResponse>> getPermissionsGrouped() {
        return permissionRepository.findAll().stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.groupingBy(PermissionResponse::module));
    }

    private Set<PermissionEntity> resolvePermissions(List<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(permissionRepository.findByCodeIn(new HashSet<>(codes)));
    }

    private RoleResponse mapToRoleResponse(RoleEntity role) {
        long userCount = userRepository.countByRoleIdAndIsDeletedFalse(role.getId());
        List<String> permissionCodes = role.getPermissions() != null
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

    private PermissionResponse mapToPermissionResponse(PermissionEntity entity) {
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
