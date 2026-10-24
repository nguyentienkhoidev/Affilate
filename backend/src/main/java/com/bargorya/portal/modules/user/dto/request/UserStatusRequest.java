package com.bargorya.portal.modules.user.dto.request;

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
    @NotNull(message = "Active status is required.")
    private Boolean isActive;
}
