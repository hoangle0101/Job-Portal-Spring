package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// Used for both creating and updating a review. The author is the logged-in user.
@Getter
@Setter
public class ReviewRequest {

    @NotNull(message = "Vui lòng chọn số sao")
    @Min(value = 1, message = "Số sao từ 1 đến 5")
    @Max(value = 5, message = "Số sao từ 1 đến 5")
    private Integer rating;

    @NotBlank(message = "Vui lòng nhập nội dung đánh giá")
    private String comment;
}
