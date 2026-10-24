package com.bargorya.portal.modules.feedback.controller;

import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.modules.feedback.dto.request.FeedbackRequest;
import com.bargorya.portal.modules.feedback.dto.response.FeedbackResponse;
import com.bargorya.portal.modules.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
public class FeedbackPublicController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponse>> submit(@Valid @RequestBody FeedbackRequest request) {
        FeedbackResponse response = feedbackService.submitFeedback(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Thank you for contacting us. We will get back to you shortly."));
    }
}
