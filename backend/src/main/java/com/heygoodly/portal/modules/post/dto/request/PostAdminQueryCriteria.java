package com.heygoodly.portal.modules.post.dto.request;

import com.heygoodly.portal.common.dto.BasePaginationCriteria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Pageable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostAdminQueryCriteria extends BasePaginationCriteria {
    private Pageable pageable;
    private Long categoryId;
    private String search;
    private String status;
    private Boolean active;
    private String tag;
    private Boolean featured;

    public Pageable pageable() {
        return pageable != null ? pageable : toPageable();
    }

    public Long categoryId() {
        return categoryId;
    }

    public String search() {
        return search;
    }

    public String status() {
        return status;
    }

    public Boolean active() {
        return active;
    }

    public String tag() {
        return tag;
    }

    public Boolean featured() {
        return featured;
    }
}
