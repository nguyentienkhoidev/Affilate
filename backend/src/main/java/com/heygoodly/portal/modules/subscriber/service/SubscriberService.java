package com.heygoodly.portal.modules.subscriber.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.subscriber.dto.request.SubscriberQueryCriteria;
import com.heygoodly.portal.modules.subscriber.dto.request.SubscriberRequest;
import com.heygoodly.portal.modules.subscriber.dto.response.SubscriberResponse;

public interface SubscriberService {

    SubscriberResponse subscribe(SubscriberRequest request, String ipAddress);

    PageResponse<SubscriberResponse> getSubscribers(SubscriberQueryCriteria criteria);

    void unsubscribe(Long id);

    void unsubscribeByEmail(String email);

    void deleteSubscriber(Long id);
}

