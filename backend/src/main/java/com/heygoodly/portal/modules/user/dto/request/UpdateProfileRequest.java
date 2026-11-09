package com.heygoodly.portal.modules.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "{validation.user.name.required}")
    @Size(max = 150, message = "{validation.user.name.size}")
    private String fullName;

    @Size(max = 50, message = "{validation.phone.size}")
    private String phone;

    @Size(max = 500, message = "{validation.avatar.size}")
    private String avatar;

    @Size(max = 150, message = "{validation.department.size}")
    private String department;

    @Size(max = 100, message = "{validation.timezone.size}")
    private String timezone;

    private String bio;

    @Size(max = 255, message = "{validation.social_x.size}")
    private String socialX;

    @Size(max = 255, message = "{validation.social_linkedin.size}")
    private String socialLinkedIn;
}

