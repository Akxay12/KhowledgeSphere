package com.knowledgeSphere.backend.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequestDTO {

    private String name;

    @NotBlank
    @Email
    private String email;
    private String username;

    @NotBlank
    private String password;

}