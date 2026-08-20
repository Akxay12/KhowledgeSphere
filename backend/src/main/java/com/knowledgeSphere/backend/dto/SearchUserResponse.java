package com.knowledgeSphere.backend.dto;


public class SearchUserResponse {

    private Long userId;
    private String username;
    private String name;
    private String profession;

    public SearchUserResponse() {
    }

    public SearchUserResponse(
            Long userId,
            String username,
            String name,
            String profession
    ) {
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.profession = profession;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
    }
}
