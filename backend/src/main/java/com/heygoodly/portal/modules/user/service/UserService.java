package com.heygoodly.portal.modules.user.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.user.dto.request.UserCriteria;
import com.heygoodly.portal.modules.user.dto.request.UserLoginRecordRequest;
import com.heygoodly.portal.modules.user.dto.request.UserRequest;
import com.heygoodly.portal.modules.user.dto.response.UserLoginRecordResponse;
import com.heygoodly.portal.modules.user.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    PageResponse<UserResponse> getUsers(Pageable pageable, UserCriteria criteria);
    PageResponse<UserResponse> getUsers(Pageable pageable, String search, Long roleId, Boolean isActive);
    UserResponse getUserById(Long id);
    UserResponse createUser(UserRequest request);
    UserResponse updateUser(Long id, UserRequest request);
    void deleteUser(Long id);
    void toggleUserStatus(Long id, boolean isActive);
    void resetUser2fa(Long id);

    List<UserLoginRecordResponse> getUserLoginRecords(Long userId);
    UserLoginRecordResponse addUserLoginRecord(Long userId, UserLoginRecordRequest request);
    UserLoginRecordResponse updateUserLoginRecord(Long userId, Long recordId, UserLoginRecordRequest request);
    void deleteUserLoginRecord(Long userId, Long recordId);
    void deleteAllUserLoginRecords(Long userId);
}
