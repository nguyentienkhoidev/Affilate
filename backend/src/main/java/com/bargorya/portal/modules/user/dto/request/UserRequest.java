package com.bargorya.portal.modules.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {

    @NotBlank(message = "Full name is required.")
    @Size(max = 150, message = "Full name must not exceed 150 characters.")
    private String fullName;

    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    @Size(max = 150, message = "Email must not exceed 150 characters.")
    private String email;

    @Size(min = 8, max = 100, message = "Password must be at least 8 characters.")
    private String password;

    private String phone;
    private String avatar;

    @NotNull(message = "Role ID is required.")
    private Long roleId;

    private Boolean isActive;
}
