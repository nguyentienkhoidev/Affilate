package com.heygoodly.portal.modules.media.dto.request;

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
public class MediaQueryCriteria {
    private String search;
    private String category;
    private String tag;
    private String format;
    private String sortBy;
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 24;
}

