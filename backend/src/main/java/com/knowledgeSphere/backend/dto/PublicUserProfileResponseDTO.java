package com.knowledgeSphere.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class PublicUserProfileResponseDTO {

    private Long userId;

    private String name;
    private String username;
    private String bio;
    private String profession;
    private String location;

    private String linkedinUrl;
    private LocalDate joined;

    private long publicationCount;
    private long followersCount;

    // resusing cause feedResponse already have that structure
    // and we want perticular users publishments
    private List<FeedResponseDTO> publications;
}
