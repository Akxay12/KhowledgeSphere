package com.knowledgeSphere.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false,unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false,unique = true)
    private String email;

    @Column(length = 300)
    private String bio;

    @Column(name = "linkdin_url")
    private String linkedinUrl;

    private String profession;

    private String location;

    private LocalDate joined;

    @Column(name = "profile_pic", columnDefinition = "BYTEA")
    private byte[] profilePic;

}
