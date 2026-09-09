package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.Shortlist;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ShortlistResponse {

    private Long id;
    private Long applicationId;
    private Long recruiterId;
    private String note;
    private LocalDateTime createdAt;

    // Converts a shortlist entity without exposing complete user or application objects.
    public static ShortlistResponse from(Shortlist shortlist) {
        return ShortlistResponse.builder()
                .id(shortlist.getId())
                .applicationId(shortlist.getApplication().getId())
                .recruiterId(shortlist.getRecruiter().getId())
                .note(shortlist.getNote())
                .createdAt(shortlist.getCreatedAt())
                .build();
    }
}
