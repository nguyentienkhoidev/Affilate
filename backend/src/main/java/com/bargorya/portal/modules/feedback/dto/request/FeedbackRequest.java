package com.bargorya.portal.modules.feedback.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class FeedbackRequest {

    @NotBlank(message = "Name is required.")
    @Size(max = 150, message = "Name must not exceed 150 characters.")
    private String name;

    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    @Size(max = 150, message = "Email must not exceed 150 characters.")
    private String email;

    @Size(max = 50, message = "Phone must not exceed 50 characters.")
    private String phone;

    @NotBlank(message = "Message is required.")
    @Size(max = 3000, message = "Message must not exceed 3000 characters.")
    private String message;
}
