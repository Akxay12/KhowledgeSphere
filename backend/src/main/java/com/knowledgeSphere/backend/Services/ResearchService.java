package com.knowledgeSphere.backend.Services;

import com.knowledgeSphere.backend.Enum.PublicationType;
import com.knowledgeSphere.backend.Enum.ResearchCategory;
import com.knowledgeSphere.backend.entities.*;
import com.knowledgeSphere.backend.repositories.*;
import com.knowledgeSphere.backend.dto.PublicationResponseDto;
import com.knowledgeSphere.backend.dto.PublishResearchRequestDTO;
import com.knowledgeSphere.backend.dto.PublishResearchResponseDTO;
import com.knowledgeSphere.backend.dto.ReadResearchResponseDTO;
import com.knowledgeSphere.backend.exceptions.ResearchNotFoundException;
import com.knowledgeSphere.backend.exceptions.UserNotFoundException;
import com.knowledgeSphere.backend.specification.PublicationSpecification;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.knowledgeSphere.backend.dto.FeedResponseDTO;
import com.knowledgeSphere.backend.entities.PublicationMetadata;

import java.util.List;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResearchService {


    private final PublicationMetadataRepository publicationMetadataRepository;

    private final ResearchContentRepository researchContentRepository;

    private final UserRepository userRepository;

    private final LikeRepository likeRepository;

    private final FollowRepository followRepository;

    public ResearchService(PublicationMetadataRepository publicationRepository,
                           ResearchContentRepository researchContent,
                           UserRepository userRepository,
                           LikeRepository likeRepository,
                           FollowRepository followRepository){

        this.publicationMetadataRepository = publicationRepository;
        this.researchContentRepository = researchContent;
        this.userRepository = userRepository;
        this.likeRepository=likeRepository;
        this.followRepository=followRepository;
    }


    @Transactional
    public PublishResearchResponseDTO publishResearch(
            PublishResearchRequestDTO publishrequest,
            HttpServletRequest request){

        Long userId = (Long) request.getAttribute("userId");


        if (userId == null) {
            throw new UserNotFoundException("Unauthorized");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User Not Found"));


        PublicationMetadata metadata =
                new PublicationMetadata();

        metadata.setTitle(publishrequest.getTitle());

        metadata.setSubtitle(publishrequest.getSubtitle());

        metadata.setCoverImageUrl(publishrequest.getCoverImageUrl());

        metadata.setLanguage(
                publishrequest.getLanguage()
        );

        metadata.setPublicationType(
                publishrequest.getPublicationType()
        );

        metadata.setCategory(
                publishrequest.getCategory()
        );

        metadata.setUser(user);

        if(publishrequest.getAuthorName()==null
                || publishrequest.getAuthorName().isBlank()){

            metadata.setAuthorName(
                    user.getName()
            );

        }else{

            metadata.setAuthorName(
                    publishrequest.getAuthorName()
            );

        }
        metadata.setPublishedAt(LocalDate.now());

        metadata.setPublicationId(
                UUID.randomUUID().toString()
        );

        publicationMetadataRepository.save(metadata);

        ResearchContent content = new ResearchContent();

        content.setContent(
                publishrequest.getContent()
        );

        content.setPublicationMetadata(metadata);

        researchContentRepository.save(content);

//         getting ready for to return object

        PublishResearchResponseDTO response =
                new PublishResearchResponseDTO();

        response.setPublicationId(
                metadata.getPublicationId()
        );

        response.setTitle(
                metadata.getTitle()
        );

        response.setSubtitle(
                metadata.getSubtitle()
        );

        response.setCoverImageUrl(
                metadata.getCoverImageUrl()
        );

        response.setAuthorName(
                metadata.getAuthorName()
        );

        response.setLanguage(
                metadata.getLanguage()
        );

        response.setCategory(
                metadata.getCategory().name()
        );

        response.setPublishedAt(
                metadata.getPublishedAt()
        );

        response.setMessage(
                "Research Published Successfully"
        );

        return response;
    }


    // just to user here for user profile Research-Cards

    private PublicationResponseDto mapToDtoWithoutContent(
            PublicationMetadata publication) {

        long likeCount =
                likeRepository.countByIdPublicationId(
                        publication.getPublicationId()
                );

        return PublicationResponseDto.builder()
                .publicationId(publication.getPublicationId())
                .title(publication.getTitle())
                .subtitle(publication.getSubtitle())
                .coverImageUrl(publication.getCoverImageUrl())
                .publicationType(publication.getPublicationType().name())
                .category(publication.getCategory().name())
                .language(publication.getLanguage())
                .publishedAt(publication.getPublishedAt())
                .authorName(publication.getAuthorName())
                .likeCount(likeCount)
                .build();
    }


    //secure jwt based endpoint
    public List<PublicationResponseDto> getMyPublications(Long userId) {

        List<PublicationMetadata> publications =
                publicationMetadataRepository
                        .findByUser_UserIdOrderByPublishedAtDesc(userId);

        return publications.stream()
                .map(this::mapToDtoWithoutContent)
                .toList();

    }


    //delete publication
    @Transactional
    public void deletePublication(String publicationId, HttpServletRequest request) {

        Long userId = (Long) request.getAttribute("userId");

        PublicationMetadata publication = publicationMetadataRepository
                .findByPublicationId(publicationId)
                .orElseThrow(() -> new RuntimeException("Publication not found"));

        if (!publication.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You are not allowed to delete this publication");
        }

        researchContentRepository
                .deleteByPublicationMetadata_PublicationId(publicationId);

        publicationMetadataRepository.delete(publication);
    }




  //=============================================================================================
    //====================== PUBLIC ====================

    @Transactional(readOnly = true)
    public ReadResearchResponseDTO getResearch(String PublicationId){
        PublicationMetadata metadata= publicationMetadataRepository.findByPublicationId(PublicationId)
                .orElseThrow(()-> new ResearchNotFoundException("Content Not Found"));

        ResearchContent content = researchContentRepository.findByPublicationMetadata(metadata)
                .orElseThrow(()-> new ResearchNotFoundException("Research Content Not Found"));


        long likeCount =
                likeRepository.countByIdPublicationId(
                        metadata.getPublicationId()
                );

        ReadResearchResponseDTO response = new ReadResearchResponseDTO();

        response.setPublicationId(
                metadata.getPublicationId());

        response.setTitle(
                metadata.getTitle());

        response.setSubtitle(
                metadata.getSubtitle());

        response.setCoverImageUrl(
                metadata.getCoverImageUrl());

        response.setAuthorName(
                metadata.getAuthorName());

        response.setLanguage(
                metadata.getLanguage());

        response.setPublicationType(
                metadata.getPublicationType().name()
        );

        response.setCategory(
                metadata.getCategory().name()
        );

        response.setPublishedAt(
                metadata.getPublishedAt());


        response.setLikeCount(likeCount);

        response.setContent(
                content.getContent());

        return response;

    }


    public List<PublicationResponseDto> getPublicationsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found");
        }

        List<PublicationMetadata> publications =
                publicationMetadataRepository.findByUser_UserIdOrderByPublishedAtDesc(userId);


        return publications.stream()
                .map(this::mapToDtoWithoutContent)
                .toList();
    }



    public List<FeedResponseDTO> getPublicFeed() {

        List<PublicationMetadata> publications =
                publicationMetadataRepository
                        .findAllByOrderByPublishedAtDesc();

        return publications.stream()
                .map(publication -> {

                    FeedResponseDTO dto = new FeedResponseDTO();

                    dto.setPublicationId(
                            publication.getPublicationId()
                    );

                    // 🔥 Author/User ID
                    if (publication.getUser() != null) {
                        dto.setUserId(
                                publication.getUser().getUserId()
                        );
                    }

                    dto.setAuthorName(
                            publication.getAuthorName()
                    );

                    dto.setTitle(
                            publication.getTitle()
                    );

                    dto.setSubtitle(
                            publication.getSubtitle()
                    );

                    dto.setCoverImageUrl(
                            publication.getCoverImageUrl()
                    );

                    dto.setPublicationType(
                            publication.getPublicationType() != null
                                    ? publication.getPublicationType().name()
                                    : null
                    );

                    dto.setCategory(
                            publication.getCategory() != null
                                    ? publication.getCategory().name()
                                    : null
                    );

                    dto.setLanguage(
                            publication.getLanguage()
                    );

                    dto.setPublishedAt(
                            publication.getPublishedAt()
                    );

                    long likeCount =
                            likeRepository.countByIdPublicationId(
                                    publication.getPublicationId()
                            );

                    dto.setLikeCount(likeCount);

                    return dto;
                })
                .toList();
    }

    // followers feed
    public List<PublicationResponseDto> getFollowingResearches(
            Long currentUserId
    ) {

        List<Follow> follows =
                followRepository.findById_FollowerId(currentUserId);

        List<Long> followedUserIds = follows.stream()
                .map(follow ->  follow.getId().getFollowingId())
                .toList();

        if (followedUserIds.isEmpty()) {
            return List.of();
        }

        List<PublicationMetadata> publications =
                publicationMetadataRepository
                        .findByUser_UserIdInOrderByPublishedAtDesc(
                                followedUserIds
                        );

        return publications.stream()
                .map(this::mapToDtoWithoutContent)
                .toList();
    }




    public List<PublicationResponseDto> searchPublications(
            String category,
            Integer year,
            String language,
            String publicationType) {

        Specification<PublicationMetadata> specification = null;

        // Category filter
        if (category != null && !category.isBlank()) {

            ResearchCategory categoryEnum =
                    ResearchCategory.valueOf(
                            category.toUpperCase()
                    );

            Specification<PublicationMetadata> categorySpec =
                    PublicationSpecification.hasCategory(categoryEnum);

            specification = specification == null
                    ? categorySpec
                    : specification.and(categorySpec);
        }

        // Year filter
        if (year != null) {

            Specification<PublicationMetadata> yearSpec =
                    PublicationSpecification.publishedInYear(year);

            specification = specification == null
                    ? yearSpec
                    : specification.and(yearSpec);
        }

        // Language filter
        if (language != null && !language.isBlank()) {

            Specification<PublicationMetadata> languageSpec =
                    PublicationSpecification.hasLanguage(language);

            specification = specification == null
                    ? languageSpec
                    : specification.and(languageSpec);
        }

        // Publication type filter
        if (publicationType != null && !publicationType.isBlank()) {

            PublicationType typeEnum =
                    PublicationType.valueOf(
                            publicationType.toUpperCase()
                    );

            Specification<PublicationMetadata> typeSpec =
                    PublicationSpecification.hasPublicationType(typeEnum);

            specification = specification == null
                    ? typeSpec
                    : specification.and(typeSpec);
        }

        // No filters
        List<PublicationMetadata> publications;

        if (specification == null) {

            publications =
                    publicationMetadataRepository.findAll();

        } else {

            publications =
                    publicationMetadataRepository
                            .findAll(specification);
        }

        return publications.stream()
                .map(this::mapToDtoWithoutContent)
                .toList();
    }

}
