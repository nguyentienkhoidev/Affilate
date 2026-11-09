package com.heygoodly.portal.modules.user.mapper;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.modules.user.dto.response.UserLoginRecordResponse;
import com.heygoodly.portal.modules.user.dto.response.UserResponse;
import com.heygoodly.portal.modules.user.entity.UserEntity;
import com.heygoodly.portal.modules.user.entity.UserLoginRecordEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Objects;

/**
 * Dedicated mapper for User security & administrative profiles.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
public class UserMapper implements BaseMapper<UserEntity, UserResponse, UserResponse> {

    @Override
    public UserResponse toDetailResponse(UserEntity user) {
        if (Objects.isNull(user)) {
            return null;
        }

        Long roleId = Objects.nonNull(user.getRole()) ? user.getRole().getId() : null;
        String roleName = Objects.nonNull(user.getRole()) ? user.getRole().getName() : null;
        String roleSlug = Objects.nonNull(user.getRole()) ? user.getRole().getSlug() : null;

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatar(),
                Boolean.TRUE.equals(user.getIsSuperAdmin()),
                Boolean.TRUE.equals(user.getIsActive()),
                Boolean.TRUE.equals(user.getTwoFactorEnabled()),
                roleId,
                roleName,
                roleSlug,
                user.getDepartment(),
                user.getTimezone(),
                user.getBio(),
                user.getSocialX(),
                user.getSocialLinkedIn(),
                user.getLastLoginAt(),
                user.getLastLoginIp(),
                user.getLoginCount(),
                user.getPasswordUpdatedAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    @Override
    public UserResponse toSummaryResponse(UserEntity user) {
        return toDetailResponse(user);
    }

    public UserLoginRecordResponse toLoginRecordResponse(UserLoginRecordEntity record) {
        if (Objects.isNull(record)) {
            return null;
        }

        String location = StringUtils.hasText(record.getLocation()) ? record.getLocation() : "Unknown";
        String device = StringUtils.hasText(record.getDevice()) ? record.getDevice() : "Web Client";
        String authMethod = StringUtils.hasText(record.getAuthMethod()) ? record.getAuthMethod() : "Password";
        String status = StringUtils.hasText(record.getStatus()) ? record.getStatus() : "Success";
        String duration = StringUtils.hasText(record.getDuration()) ? record.getDuration() : "Active now";

        return new UserLoginRecordResponse(
                record.getId(),
                record.getUserId(),
                record.getIpAddress(),
                location,
                device,
                authMethod,
                status,
                duration,
                record.getCreatedAt()
        );
    }
}

