package com.knowledgeSphere.backend.dto;

import com.knowledgeSphere.backend.Enum.PublicationType;
import com.knowledgeSphere.backend.Enum.ResearchCategory;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReadResearchResponseDTO {

    private String publicationId;

    private String title;

    private String subtitle;

    private String coverImageUrl;

    private String content;

    private String authorName;

    private String language;

    private String publicationType;

    private String category;

    private LocalDate publishedAt;

    private long likeCount;
}