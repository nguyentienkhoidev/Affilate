package com.heygoodly.portal.modules.user.dto.request;

import com.heygoodly.portal.common.dto.BasePaginationCriteria;
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
public class UserCriteria extends BasePaginationCriteria {
    private String search;
    private Long roleId;
    private String roleName;
    private String role;
    private Boolean isActive;
    private Boolean twoFactorEnabled;

    public String resolveRole() {
        return roleName != null && !roleName.isBlank() ? roleName : role;
    }
}

