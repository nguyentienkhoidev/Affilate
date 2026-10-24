package com.bargorya.portal.modules.user.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.modules.user.dto.request.UserRequest;
import com.bargorya.portal.modules.user.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {
    PageResponse<UserResponse> getUsers(Pageable pageable, String search, Long roleId, Boolean isActive);
    UserResponse getUserById(Long id);
    UserResponse createUser(UserRequest request);
    UserResponse updateUser(Long id, UserRequest request);
    void deleteUser(Long id);
    void toggleUserStatus(Long id, boolean isActive);
    void resetUser2fa(Long id);
}
