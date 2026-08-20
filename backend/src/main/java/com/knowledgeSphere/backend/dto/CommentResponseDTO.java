package com.knowledgeSphere.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentResponseDTO {

    private Long commentId;
    private Long userId;
    private String username;
    private String profilePictureUrl;
    private String content;
}