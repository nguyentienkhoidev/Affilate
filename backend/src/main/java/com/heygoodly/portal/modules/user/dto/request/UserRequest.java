package com.heygoodly.portal.modules.user.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank(message = "{validation.user.name.required}")
    @Size(max = 150, message = "{validation.user.name.size}")
    private String fullName;

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    @Size(max = 150, message = "{validation.email.size}")
    private String email;

    @Size(min = 6, max = 100, message = "{validation.password.size}")
    private String password;

    @JsonAlias({"phoneNumber"})
    @Pattern(regexp = "^$|^\\+?[0-9\\s-]{8,20}$", message = "{validation.phone.invalid}")
    private String phone;

    @JsonAlias({"avatarUrl"})
    private String avatar;

    private Long roleId;

    private String roleName;

    private Boolean isActive;

    private String department;
    private String timezone;
    private String bio;
    private String socialX;
    private String socialLinkedIn;
}
