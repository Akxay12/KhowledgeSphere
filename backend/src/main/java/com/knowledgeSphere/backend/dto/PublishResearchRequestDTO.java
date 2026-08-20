package com.knowledgeSphere.backend.dto;

import com.knowledgeSphere.backend.Enum.PublicationType;
import com.knowledgeSphere.backend.Enum.ResearchCategory;
import com.knowledgeSphere.backend.dto.PublishResearchRequestDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublishResearchRequestDTO {

    private Long userId;

    private String title;

    private String subtitle;

    private String coverImageUrl;

    private PublicationType publicationType;

    private ResearchCategory category;

    private String authorName;

    private String language;

    private String content;

}
