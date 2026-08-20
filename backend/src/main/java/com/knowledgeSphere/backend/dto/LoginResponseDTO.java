package com.knowledgeSphere.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LoginResponseDTO {

    private Long userId;

    private String name;

    private String username;

    private String email;

    private String bio;

    private String profession;

    private String location;

    private String linkedinUrl;

    private String token;

    private LocalDate joined;

    private long publicationCount;

    private long followersCount;

}