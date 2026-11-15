package com.heygoodly.portal.common.dto;

import java.util.List;

/**
 * Payload for batch-reordering entities by their ordered ID sequence.
 */
public record ReorderRequest(List<Long> orderedIds) {}
