package com.knowledgeSphere.backend.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PublicationResponseDto {

    private String publicationId;
    private String title;
    private String subtitle;
    private String coverImageUrl;
    private String publicationType;
    private String category;
    private String language;
    private LocalDate publishedAt;
    private String authorName;
    private long likeCount;

}