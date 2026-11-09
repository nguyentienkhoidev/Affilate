package com.heygoodly.portal.security;

import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.constant.SecurityConstants;
import com.heygoodly.portal.modules.role.entity.PermissionEntity;
import com.heygoodly.portal.modules.role.entity.RoleEntity;
import com.heygoodly.portal.modules.user.entity.UserEntity;
import com.heygoodly.portal.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        String.format("User not found with %s: %s", EntityFieldConstants.EMAIL, email)));

        Set<GrantedAuthority> authorities = new HashSet<>();

        // Add Role Authority
        RoleEntity role = user.getRole();
        if (role != null) {
            authorities.add(new SimpleGrantedAuthority(SecurityConstants.ROLE_PREFIX + role.getSlug().toUpperCase()));
            // Add individual permission codes
            if (role.getPermissions() != null) {
                for (PermissionEntity permission : role.getPermissions()) {
                    authorities.add(new SimpleGrantedAuthority(permission.getCode()));
                }
            }
        }

        // Add Super Admin role if flagged
        if (Boolean.TRUE.equals(user.getIsSuperAdmin())) {
            authorities.add(new SimpleGrantedAuthority(SecurityConstants.SUPER_ADMIN_ROLE));
        }

        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .password(user.getPasswordHash())
                .isSuperAdmin(Boolean.TRUE.equals(user.getIsSuperAdmin()))
                .twoFactorEnabled(Boolean.TRUE.equals(user.getTwoFactorEnabled()))
                .active(Boolean.TRUE.equals(user.getIsActive()))
                .authorities(authorities)
                .build();
    }
}
