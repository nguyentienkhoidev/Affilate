package com.heygoodly.portal.modules.subscriber.dto.request;

import com.heygoodly.portal.common.dto.BasePaginationCriteria;
import com.heygoodly.portal.modules.subscriber.enums.SubscriberStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriberQueryCriteria extends BasePaginationCriteria {
    private String search;
    private SubscriberStatus status;
    private String statusStr;
    private String source;
    private Pageable pageable;

    public Pageable getEffectivePageable() {
        return pageable != null ? pageable : toPageable();
    }

    public SubscriberStatus resolveStatus() {
        if (status != null) return status;
        if (StringUtils.hasText(statusStr)) {
            return SubscriberStatus.fromValue(statusStr);
        }
        return null;
    }
}
