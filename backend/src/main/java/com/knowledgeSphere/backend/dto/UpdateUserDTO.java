package com.knowledgeSphere.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserDTO {

    private String name;

    private String profession;

    private String bio;

    private String location;

    private String linkedinUrl;

}
