package com.knowledgeSphere.backend.dto;


import java.time.LocalDate;

public class SearchPublicationResponse {

    private String publicationId;
    private String title;
    private String subtitle;
    private String category;
    private String publicationType;
    private String language;

    private String authorName;
    private String username;

    private String coverImageUrl;
    private LocalDate publishedAt;

    public SearchPublicationResponse() {
    }

    public SearchPublicationResponse(
            String publicationId,
            String title,
            String subtitle,
            String category,
            String publicationType,
            String language,
            String authorName,
            String username,
            String coverImageUrl,
            LocalDate publishedAt
    ) {
        this.publicationId = publicationId;
        this.title = title;
        this.subtitle = subtitle;
        this.category = category;
        this.publicationType = publicationType;
        this.language = language;
        this.authorName = authorName;
        this.username = username;
        this.coverImageUrl = coverImageUrl;
        this.publishedAt = publishedAt;
    }

    // getters and setters
}