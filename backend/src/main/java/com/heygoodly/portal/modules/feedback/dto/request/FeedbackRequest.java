package com.heygoodly.portal.modules.feedback.dto.request;

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

    @NotBlank(message = "{validation.name.required}")
    @Size(max = 150, message = "{validation.name.size}")
    private String name;

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    @Size(max = 150, message = "{validation.email.size}")
    private String email;

    @Size(max = 50, message = "{validation.phone.size}")
    private String phone;

    @NotBlank(message = "{validation.content.required}")
    @Size(max = 3000, message = "{validation.content.size}")
    private String message;
}
