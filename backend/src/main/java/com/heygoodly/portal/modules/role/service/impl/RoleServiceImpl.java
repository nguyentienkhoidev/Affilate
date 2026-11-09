package com.heygoodly.portal.modules.role.service.impl;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.BadRequestException;
import com.heygoodly.portal.common.exception.DuplicateResourceException;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.common.util.SlugUtils;
import com.heygoodly.portal.modules.role.dto.request.RoleRequest;
import com.heygoodly.portal.modules.role.dto.response.PermissionResponse;
import com.heygoodly.portal.modules.role.dto.response.RoleResponse;
import com.heygoodly.portal.modules.role.entity.PermissionEntity;
import com.heygoodly.portal.modules.role.entity.RoleEntity;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import com.heygoodly.portal.modules.role.mapper.RoleMapper;
import com.heygoodly.portal.modules.role.repository.PermissionRepository;
import com.heygoodly.portal.modules.role.repository.RoleRepository;
import com.heygoodly.portal.modules.role.service.RoleService;
import com.heygoodly.portal.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final RoleMapper roleMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        log.info("Fetching all roles");
        List<RoleEntity> roles = roleRepository.findAll();
        Map<Long, Long> countsMap = fetchUserCounts(roles);

        return roles.stream()
                .map(r -> roleMapper.toRoleResponse(r, countsMap.getOrDefault(r.getId(), 0L)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoleResponse> getRoles(Pageable pageable, String search) {
        log.info("Fetching paged roles: search='{}', page={}", search, pageable.getPageNumber());

        Specification<RoleEntity> spec = (root, query, cb) -> {
            if (StringUtils.hasText(search)) {
                String pattern = new StringBuilder(AppConstants.PERCENT)
                        .append(search.trim().toLowerCase())
                        .append(AppConstants.PERCENT)
                        .toString();
                return cb.or(
                        cb.like(cb.lower(root.get(EntityFieldConstants.NAME)), pattern),
                        cb.like(cb.lower(root.get(EntityFieldConstants.SLUG)), pattern),
                        cb.like(cb.lower(root.get(EntityFieldConstants.DESCRIPTION)), pattern)
                );
            }
            return cb.conjunction();
        };

        Page<RoleEntity> page = roleRepository.findAll(spec, pageable);
        Map<Long, Long> countsMap = fetchUserCounts(page.getContent());

        List<RoleResponse> content = page.getContent().stream()
                .map(r -> roleMapper.toRoleResponse(r, countsMap.getOrDefault(r.getId(), 0L)))
                .toList();

        return PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        log.info("Fetching role by id: {}", id);
        RoleEntity role = roleRepository.findWithPermissionsById(id)
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_ROLE, EntityFieldConstants.ID, id));
        long count = userRepository.countByRoleIdAndIsDeletedFalse(id);
        return roleMapper.toRoleResponse(role, count);
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        log.info("Creating new role: name={}", request.getName());
        String slug = StringUtils.hasText(request.getSlug())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getName());

        if (roleRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException(
                    String.format("Role with slug '%s' already exists.", slug));
        }

        Set<PermissionEntity> permissions = resolvePermissions(request.getPermissions());

        RoleEntity role = RoleEntity.builder()
                .name(NullSafeUtils.safeTrim(request.getName()))
                .slug(slug)
                .description(NullSafeUtils.safeTrim(request.getDescription()))
                .isSystem(false)
                .permissions(permissions)
                .build();

        RoleEntity saved = roleRepository.save(role);
        log.info("Successfully created role id={}", saved.getId());
        return roleMapper.toRoleResponse(saved, 0L);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, RoleRequest request) {
        log.info("Updating role id={}", id);
        RoleEntity role = roleRepository.findWithPermissionsById(id)
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_ROLE, EntityFieldConstants.ID, id));

        if (RoleCode.ADMIN.getSlug().equalsIgnoreCase(role.getSlug()) || RoleCode.SUPER_ADMIN.getSlug().equalsIgnoreCase(role.getSlug())) {
            throw new BadRequestException("Super Administrator permissions are locked and cannot be modified.");
        }

        if (Boolean.TRUE.equals(role.getIsSystem())) {
            role.setDescription(NullSafeUtils.safeTrim(request.getDescription()));
        } else {
            role.setName(NullSafeUtils.safeTrim(request.getName()));
            if (StringUtils.hasText(request.getSlug())) {
                String newSlug = SlugUtils.toSlug(request.getSlug());
                if (!newSlug.equals(role.getSlug()) && roleRepository.existsBySlug(newSlug)) {
                    throw new DuplicateResourceException(
                            String.format("Role with slug '%s' already exists.", newSlug));
                }
                role.setSlug(newSlug);
            }
            role.setDescription(NullSafeUtils.safeTrim(request.getDescription()));
        }

        if (Objects.nonNull(request.getPermissions())) {
            role.setPermissions(resolvePermissions(request.getPermissions()));
        }

        RoleEntity updated = roleRepository.save(role);
        long count = userRepository.countByRoleIdAndIsDeletedFalse(id);
        log.info("Successfully updated role id={}", updated.getId());
        return roleMapper.toRoleResponse(updated, count);
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        log.info("Deleting role id={}", id);
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_ROLE, EntityFieldConstants.ID, id));

        if (Boolean.TRUE.equals(role.getIsSystem())) {
            throw new BadRequestException("System roles cannot be deleted.");
        }

        long userCount = userRepository.countByRoleIdAndIsDeletedFalse(id);
        if (userCount > 0) {
            throw new BadRequestException(
                    String.format("Cannot delete role assigned to %d active user(s).", userCount));
        }

        roleRepository.delete(role);
        log.info("Successfully deleted role id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(roleMapper::toPermissionResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<PermissionResponse>> getPermissionsGrouped() {
        return permissionRepository.findAll().stream()
                .map(roleMapper::toPermissionResponse)
                .collect(Collectors.groupingBy(PermissionResponse::module));
    }

    private Map<Long, Long> fetchUserCounts(List<RoleEntity> roles) {
        if (CollectionUtils.isEmpty(roles)) {
            return Collections.emptyMap();
        }
        Set<Long> ids = roles.stream().map(RoleEntity::getId).filter(Objects::nonNull).collect(Collectors.toSet());
        if (CollectionUtils.isEmpty(ids)) {
            return Collections.emptyMap();
        }
        return userRepository.countUsersByRoleIds(ids).stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1], (a, b) -> a));
    }

    private Set<PermissionEntity> resolvePermissions(List<String> codes) {
        if (CollectionUtils.isEmpty(codes)) {
            return new HashSet<>();
        }
        return new HashSet<>(permissionRepository.findByCodeIn(new HashSet<>(codes)));
    }
}
