package com.knowledgeSphere.backend.Services;


import com.knowledgeSphere.backend.dto.PublicationResponseDto;
import com.knowledgeSphere.backend.dto.SearchResponse;
import com.knowledgeSphere.backend.dto.SearchUserResponse;
import com.knowledgeSphere.backend.entities.PublicationMetadata;
import com.knowledgeSphere.backend.entities.User;
import com.knowledgeSphere.backend.repositories.PublicationMetadataRepository;
import com.knowledgeSphere.backend.repositories.UserRepository;
import com.knowledgeSphere.backend.specification.PublicationMetadataSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final PublicationMetadataRepository publicationMetadataRepository;
    private final UserRepository userRepository;

    public SearchResponse search(String query) {

        String searchQuery = query == null ? "" : query.trim();

        // -----------------------------
        // USER SEARCH
        // -----------------------------

        List<User> users;

        if (searchQuery.isEmpty()) {
            users = List.of();
        } else {
            users = userRepository
                    .findByUsernameContainingIgnoreCase(searchQuery);
        }

        List<SearchUserResponse> userResults = users.stream()
                .map(user -> new SearchUserResponse(
                        user.getUserId(),
                        user.getUsername(),
                        user.getName(),
                        user.getProfession()
                ))
                .toList();


        // -----------------------------
        // RESEARCH SEARCH
        // -----------------------------

        List<PublicationMetadata> publications;

        if (searchQuery.isEmpty()) {
            publications = List.of();
        } else {
            publications = publicationMetadataRepository.findAll(
                    PublicationMetadataSpecification.search(searchQuery)
            );
        }


        // -----------------------------
        // CONVERT RESEARCH TO EXISTING
        // RESEARCH RESPONSE
        // -----------------------------

        List<PublicationResponseDto> researchResults =
                publications.stream()
                        .map(this::convertToResearchResponse)
                        .toList();


        // -----------------------------
        // FINAL RESPONSE
        // -----------------------------

        return new SearchResponse(
                researchResults,
                userResults
        );
    }


    private PublicationResponseDto convertToResearchResponse(
            PublicationMetadata publication
    ) {

        return PublicationResponseDto.builder()
                .publicationId(publication.getPublicationId())
                .title(publication.getTitle())
                .subtitle(publication.getSubtitle())
                .coverImageUrl(publication.getCoverImageUrl())
                .publicationType(
                        publication.getPublicationType() != null
                                ? publication.getPublicationType().name()
                                : null
                )
                .category(
                        publication.getCategory() != null
                                ? publication.getCategory().name()
                                : null
                )
                .language(publication.getLanguage())
                .publishedAt(publication.getPublishedAt())
                .authorName(publication.getAuthorName())
                .likeCount(0)
                .build();
    }
}
