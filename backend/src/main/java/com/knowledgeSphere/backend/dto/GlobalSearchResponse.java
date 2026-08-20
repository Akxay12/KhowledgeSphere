package com.knowledgeSphere.backend.dto;


import java.util.List;

public class GlobalSearchResponse {

    private List<SearchUserResponse> users;
    private List<SearchPublicationResponse> publications;

    private long totalUsers;
    private long totalPublications;

    public GlobalSearchResponse() {
    }

    public GlobalSearchResponse(
            List<SearchUserResponse> users,
            List<SearchPublicationResponse> publications
    ) {
        this.users = users;
        this.publications = publications;

        this.totalUsers = users.size();
        this.totalPublications = publications.size();
    }

    public List<SearchUserResponse> getUsers() {
        return users;
    }

    public void setUsers(List<SearchUserResponse> users) {
        this.users = users;
        this.totalUsers = users != null ? users.size() : 0;
    }

    public List<SearchPublicationResponse> getPublications() {
        return publications;
    }

    public void setPublications(List<SearchPublicationResponse> publications) {
        this.publications = publications;
        this.totalPublications =
                publications != null ? publications.size() : 0;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalPublications() {
        return totalPublications;
    }
}
