package com.heygoodly.portal.modules.user.service.impl;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.BadRequestException;
import com.heygoodly.portal.common.exception.DuplicateResourceException;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.IpLocationUtils;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.common.util.UserAgentUtils;
import com.heygoodly.portal.modules.role.entity.RoleEntity;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import com.heygoodly.portal.modules.role.repository.RoleRepository;
import com.heygoodly.portal.modules.user.dto.request.UserCriteria;
import com.heygoodly.portal.modules.user.dto.request.UserLoginRecordRequest;
import com.heygoodly.portal.modules.user.dto.request.UserRequest;
import com.heygoodly.portal.modules.user.dto.response.UserLoginRecordResponse;
import com.heygoodly.portal.modules.user.dto.response.UserResponse;
import com.heygoodly.portal.modules.user.entity.UserEntity;
import com.heygoodly.portal.modules.user.entity.UserLoginRecordEntity;
import com.heygoodly.portal.modules.user.mapper.UserMapper;
import com.heygoodly.portal.modules.user.repository.UserLoginRecordRepository;
import com.heygoodly.portal.modules.user.repository.UserRepository;
import com.heygoodly.portal.modules.user.service.UserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserLoginRecordRepository loginRecordRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(Pageable pageable, UserCriteria criteria) {
        log.info("Listing administrative users: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        Specification<UserEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get(EntityFieldConstants.IS_DELETED)));

            if (Objects.nonNull(criteria)) {
                if (StringUtils.hasText(criteria.getSearch())) {
                    String pattern = new StringBuilder(AppConstants.PERCENT)
                            .append(criteria.getSearch().trim().toLowerCase())
                            .append(AppConstants.PERCENT)
                            .toString();
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get(EntityFieldConstants.FULL_NAME)), pattern),
                            cb.like(cb.lower(root.get(EntityFieldConstants.EMAIL)), pattern)
                    ));
                }

                if (Objects.nonNull(criteria.getRoleId())) {
                    predicates.add(cb.equal(root.get(EntityFieldConstants.ROLE).get(EntityFieldConstants.ID), criteria.getRoleId()));
                } else if (StringUtils.hasText(criteria.getRoleName()) && !AppConstants.ALL.equalsIgnoreCase(criteria.getRoleName())) {
                    predicates.add(cb.equal(cb.lower(root.get(EntityFieldConstants.ROLE).get(EntityFieldConstants.NAME)), criteria.getRoleName().trim().toLowerCase()));
                }

                if (Objects.nonNull(criteria.getIsActive())) {
                    predicates.add(cb.equal(root.get(EntityFieldConstants.IS_ACTIVE), criteria.getIsActive()));
                }

                if (Objects.nonNull(criteria.getTwoFactorEnabled())) {
                    predicates.add(cb.equal(root.get(EntityFieldConstants.TWO_FACTOR_ENABLED), criteria.getTwoFactorEnabled()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<UserEntity> page = userRepository.findAll(spec, pageable);
        List<UserResponse> items = userMapper.toSummaryResponseList(page.getContent());

        return PageResponse.of(items, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(Pageable pageable, String search, Long roleId, Boolean isActive) {
        UserCriteria criteria = UserCriteria.builder()
                .search(search)
                .roleId(roleId)
                .isActive(isActive)
                .build();
        return getUsers(pageable, criteria);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        UserEntity user = userRepository.findById(id)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(String.format("User not found with %s: %d", EntityFieldConstants.ID, id)));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailAndIsDeletedFalse(email)) {
            throw new DuplicateResourceException(String.format("User with %s '%s' already exists.", EntityFieldConstants.EMAIL, email));
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required for new users.");
        }

        RoleEntity role = resolveRole(request.getRoleId(), request.getRoleName());

        UserEntity user = UserEntity.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword().trim()))
                .phone(NullSafeUtils.trimToNull(request.getPhone()))
                .avatar(NullSafeUtils.trimToNull(request.getAvatar()))
                .department(NullSafeUtils.trimToNull(request.getDepartment()))
                .timezone(NullSafeUtils.trimToNull(request.getTimezone()))
                .bio(NullSafeUtils.trimToNull(request.getBio()))
                .socialX(NullSafeUtils.trimToNull(request.getSocialX()))
                .socialLinkedIn(NullSafeUtils.trimToNull(request.getSocialLinkedIn()))
                .role(role)
                .isSuperAdmin(false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .twoFactorEnabled(false)
                .passwordUpdatedAt(Instant.now())
                .loginCount(0)
                .build();

        UserEntity saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        UserEntity user = userRepository.findById(id)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(String.format("User not found with %s: %d", EntityFieldConstants.ID, id)));

        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailAndIdNotAndIsDeletedFalse(email, id)) {
            throw new DuplicateResourceException(String.format("User with %s '%s' already exists.", EntityFieldConstants.EMAIL, email));
        }

        RoleEntity role = resolveRole(request.getRoleId(), request.getRoleName());

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhone(NullSafeUtils.trimToNull(request.getPhone()));
        user.setAvatar(NullSafeUtils.trimToNull(request.getAvatar()));
        user.setDepartment(NullSafeUtils.trimToNull(request.getDepartment()));
        user.setTimezone(NullSafeUtils.trimToNull(request.getTimezone()));
        user.setBio(NullSafeUtils.trimToNull(request.getBio()));
        user.setSocialX(NullSafeUtils.trimToNull(request.getSocialX()));
        user.setSocialLinkedIn(NullSafeUtils.trimToNull(request.getSocialLinkedIn()));
        user.setRole(role);

        if (request.getIsActive() != null) {
            if (Boolean.TRUE.equals(user.getIsSuperAdmin()) && !request.getIsActive()) {
                throw new BadRequestException("Super Administrator account cannot be deactivated.");
            }
            user.setIsActive(request.getIsActive());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
            user.setPasswordUpdatedAt(Instant.now());
        }

        UserEntity updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(String.format("User not found with %s: %d", EntityFieldConstants.ID, id)));

        if (Boolean.TRUE.equals(user.getIsSuperAdmin())) {
            throw new BadRequestException("Super Administrator account cannot be deleted.");
        }

        user.setIsDeleted(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long id, boolean isActive) {
        UserEntity user = userRepository.findById(id)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(String.format("User not found with %s: %d", EntityFieldConstants.ID, id)));

        if (Boolean.TRUE.equals(user.getIsSuperAdmin()) && !isActive) {
            throw new BadRequestException("Super Administrator account cannot be deactivated.");
        }

        user.setIsActive(isActive);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resetUser2fa(Long id) {
        UserEntity user = userRepository.findById(id)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(String.format("User not found with %s: %d", EntityFieldConstants.ID, id)));

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setTwoFactorRecoveryCodes(null);
        userRepository.save(user);
        log.info("2FA reset successfully for user id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserLoginRecordResponse> getUserLoginRecords(Long userId) {
        return loginRecordRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToLoginRecordResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserLoginRecordResponse addUserLoginRecord(Long userId, UserLoginRecordRequest request) {
        UserEntity user = userRepository.findById(userId)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(String.format("User not found with %s: %d", EntityFieldConstants.ID, userId)));

        String ip = NullSafeUtils.safeTrim(request.getIpAddress());
        if (ip.isEmpty() || AppConstants.UNKNOWN.equalsIgnoreCase(ip)) {
            ip = AppConstants.DEFAULT_LOOPBACK_IPV4;
        }
        if (AppConstants.DEFAULT_LOOPBACK_IPV6.equals(ip) || AppConstants.DEFAULT_LOOPBACK_IPV6_FULL.equals(ip)) {
            ip = AppConstants.DEFAULT_LOOPBACK_IPV4;
        }

        String location = NullSafeUtils.safeTrim(request.getLocation());
        if (location.isEmpty()) {
            location = IpLocationUtils.resolveLocation(ip);
        }

        String rawDevice = NullSafeUtils.safeTrim(request.getDevice());
        if (rawDevice.isEmpty()) {
            rawDevice = "Desktop Chrome / macOS";
        }
        String device = UserAgentUtils.parsePlatformOs(rawDevice);

        String authMethod = NullSafeUtils.safeTrim(request.getAuthMethod());
        if (authMethod.isEmpty()) {
            authMethod = Boolean.TRUE.equals(user.getTwoFactorEnabled()) ? "2FA (TOTP)" : "Password";
        }

        String status = NullSafeUtils.safeTrim(request.getStatus());
        if (status.isEmpty()) {
            status = "Success";
        }

        String duration = NullSafeUtils.safeTrim(request.getDuration());
        if (duration.isEmpty()) {
            duration = "Active now";
        }

        UserLoginRecordEntity record = UserLoginRecordEntity.builder()
                .userId(userId)
                .ipAddress(ip)
                .location(location)
                .device(device)
                .authMethod(authMethod)
                .status(status)
                .duration(duration)
                .createdAt(Instant.now())
                .build();

        UserLoginRecordEntity saved = loginRecordRepository.save(record);

        // Update user stats
        user.setLastLoginAt(Instant.now());
        user.setLastLoginIp(ip);
        user.setLoginCount((user.getLoginCount() == null ? 0 : user.getLoginCount()) + 1);
        userRepository.save(user);

        return mapToLoginRecordResponse(saved);
    }

    @Override
    @Transactional
    public UserLoginRecordResponse updateUserLoginRecord(Long userId, Long recordId, UserLoginRecordRequest request) {
        UserLoginRecordEntity record = loginRecordRepository.findById(recordId)
                .filter(r -> r.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Login record not found with %s: %d", EntityFieldConstants.ID, recordId)));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            record.setStatus(request.getStatus().trim());
        }
        if (request.getDuration() != null && !request.getDuration().isBlank()) {
            record.setDuration(request.getDuration().trim());
        }
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            record.setLocation(request.getLocation().trim());
        }
        if (request.getDevice() != null && !request.getDevice().isBlank()) {
            record.setDevice(UserAgentUtils.parsePlatformOs(request.getDevice().trim()));
        }
        if (request.getIpAddress() != null && !request.getIpAddress().isBlank()) {
            record.setIpAddress(request.getIpAddress().trim());
        }
        if (request.getAuthMethod() != null && !request.getAuthMethod().isBlank()) {
            record.setAuthMethod(request.getAuthMethod().trim());
        }

        UserLoginRecordEntity updated = loginRecordRepository.save(record);

        userRepository.findById(userId).ifPresent(user -> {
            List<UserLoginRecordEntity> list = loginRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!list.isEmpty()) {
                user.setLastLoginAt(list.get(0).getCreatedAt());
                user.setLastLoginIp(list.get(0).getIpAddress());
                userRepository.save(user);
            }
        });

        return mapToLoginRecordResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUserLoginRecord(Long userId, Long recordId) {
        loginRecordRepository.deleteByUserIdAndId(userId, recordId);
        userRepository.findById(userId).ifPresent(user -> {
            List<UserLoginRecordEntity> remaining = loginRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
            user.setLoginCount(remaining.size());
            if (!remaining.isEmpty()) {
                user.setLastLoginAt(remaining.get(0).getCreatedAt());
                user.setLastLoginIp(remaining.get(0).getIpAddress());
            } else {
                user.setLastLoginAt(null);
                user.setLastLoginIp(null);
            }
            userRepository.save(user);
        });
    }

    @Override
    @Transactional
    public void deleteAllUserLoginRecords(Long userId) {
        loginRecordRepository.deleteAllByUserId(userId);
        userRepository.findById(userId).ifPresent(user -> {
            user.setLoginCount(0);
            user.setLastLoginAt(null);
            user.setLastLoginIp(null);
            userRepository.save(user);
        });
    }

    private RoleEntity resolveRole(Long roleId, String roleName) {
        if (roleId != null) {
            return roleRepository.findById(roleId)
                    .orElseThrow(() -> new ResourceNotFoundException(String.format("Role not found with %s: %d", EntityFieldConstants.ID, roleId)));
        }
        if (roleName != null && !roleName.isBlank()) {
            String clean = roleName.trim().toLowerCase();
            return roleRepository.findBySlug(clean)
                    .or(() -> roleRepository.findAll().stream()
                            .filter(r -> r.getName().equalsIgnoreCase(roleName.trim()))
                            .findFirst())
                    .orElseGet(() -> roleRepository.findBySlug(RoleCode.STAFF.getSlug())
                            .orElseGet(() -> roleRepository.findAll().stream().findFirst()
                                    .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_ROLE, EntityFieldConstants.SLUG, RoleCode.STAFF.getSlug()))));
        }
        return roleRepository.findBySlug(RoleCode.STAFF.getSlug())
                .orElseGet(() -> roleRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_ROLE, EntityFieldConstants.SLUG, RoleCode.STAFF.getSlug())));
    }

    private UserResponse mapToUserResponse(UserEntity user) {
        return userMapper.toDetailResponse(user);
    }

    private UserLoginRecordResponse mapToLoginRecordResponse(UserLoginRecordEntity record) {
        return userMapper.toLoginRecordResponse(record);
    }
}
