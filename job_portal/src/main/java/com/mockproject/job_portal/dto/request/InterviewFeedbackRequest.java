package com.mockproject.job_portal.dto.request;

import com.mockproject.job_portal.entity.enums.FeedbackResult;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterviewFeedbackRequest {

    @NotNull(message = "Vui lòng nhập điểm")
    @Min(value = 0, message = "Điểm từ 0 đến 100")
    @Max(value = 100, message = "Điểm từ 0 đến 100")
    private Integer score;

    private String comments;

    @NotNull(message = "Vui lòng chọn kết quả PASS hoặc FAIL")
    private FeedbackResult result;
}
