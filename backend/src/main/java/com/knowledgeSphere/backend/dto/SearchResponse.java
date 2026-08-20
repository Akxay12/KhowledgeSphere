package com.knowledgeSphere.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchResponse {

    private List<PublicationResponseDto> researches;
    private List<SearchUserResponse> users;
}
