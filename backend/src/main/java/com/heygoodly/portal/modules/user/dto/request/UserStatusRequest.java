package com.heygoodly.portal.modules.user.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusRequest {
    @NotNull(message = "{validation.field.required}")
    private Boolean isActive;
}
