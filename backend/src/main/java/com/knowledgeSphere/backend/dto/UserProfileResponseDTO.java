package com.knowledgeSphere.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileResponseDTO {

    private Long userId;
    private String name;
    private String username;
    private String email;
    private String bio;
    private String profession;
    private String location;
    private String linkedinUrl;

}