package com.knowledgeSphere.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PublishResearchResponseDTO {

    private String publicationId;

    private String title;

    private String subtitle;

    private String coverImageUrl;

    private String authorName;

    private String language;

    private String publicationType;

    private String category;

    private LocalDate publishedAt;

    private String message;

    private long likeCount;
}