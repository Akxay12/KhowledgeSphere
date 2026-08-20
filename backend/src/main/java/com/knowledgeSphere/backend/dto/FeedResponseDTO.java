package com.knowledgeSphere.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class FeedResponseDTO {

    private String publicationId;

    private Long userId;

    private String authorName;

    private String title;

    private String subtitle;

    private String coverImageUrl;

    private String publicationType;

    private String category;

    private String language;

    private LocalDate publishedAt;

    private long likeCount;
}