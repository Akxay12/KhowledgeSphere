package com.knowledgeSphere.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class LikeResponseDTO {

    private boolean liked;

    private long likeCount;

    private List<String> likedPublicationIds;

}