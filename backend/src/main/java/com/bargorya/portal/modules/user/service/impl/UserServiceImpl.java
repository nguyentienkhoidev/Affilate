package com.bargorya.portal.modules.user.service.impl;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.exception.BadRequestException;
import com.bargorya.portal.common.exception.DuplicateResourceException;
import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.modules.role.entity.RoleEntity;
import com.bargorya.portal.modules.role.repository.RoleRepository;
import com.bargorya.portal.modules.user.dto.request.UserRequest;
import com.bargorya.portal.modules.user.dto.response.UserResponse;
import com.bargorya.portal.modules.user.entity.UserEntity;
import com.bargorya.portal.modules.user.repository.UserRepository;
import com.bargorya.portal.modules.user.service.UserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(Pageable pageable, String search, Long roleId, Boolean isActive) {
        Specification<UserEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }

            if (roleId != null) {
                predicates.add(cb.equal(root.get("role").get("id"), roleId));
            }

            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<UserEntity> page = userRepository.findAll(spec, pageable);
        List<UserResponse> items = page.getContent().stream()
                .map(this::mapToUserResponse)
                .toList();

        return PageResponse.of(items, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        UserEntity user = userRepository.findById(id)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail().toLowerCase().trim())) {
            throw new DuplicateResourceException("User with email '" + request.getEmail() + "' already exists.");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required for new users.");
        }

        RoleEntity role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + request.getRoleId()));

        UserEntity user = UserEntity.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .avatar(request.getAvatar())
                .role(role)
                .isSuperAdmin(false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .twoFactorEnabled(false)
                .build();

        UserEntity saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        UserEntity user = userRepository.findById(id)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailAndIdNotAndIsDeletedFalse(email, id)) {
            throw new DuplicateResourceException("User with email '" + email + "' already exists.");
        }

        RoleEntity role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + request.getRoleId()));

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone());
        user.setAvatar(request.getAvatar());
        user.setRole(role);

        if (request.getIsActive() != null) {
            // Cannot deactivate super admin account
            if (Boolean.TRUE.equals(user.getIsSuperAdmin()) && !request.getIsActive()) {
                throw new BadRequestException("Super Administrator account cannot be deactivated.");
            }
            user.setIsActive(request.getIsActive());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        UserEntity updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setTwoFactorRecoveryCodes(null);
        userRepository.save(user);
        log.info("2FA reset successfully for user id: {}", id);
    }

    private UserResponse mapToUserResponse(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatar(),
                Boolean.TRUE.equals(user.getIsSuperAdmin()),
                Boolean.TRUE.equals(user.getIsActive()),
                Boolean.TRUE.equals(user.getTwoFactorEnabled()),
                user.getRole() != null ? user.getRole().getId() : null,
                user.getRole() != null ? user.getRole().getName() : null,
                user.getRole() != null ? user.getRole().getSlug() : null,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
