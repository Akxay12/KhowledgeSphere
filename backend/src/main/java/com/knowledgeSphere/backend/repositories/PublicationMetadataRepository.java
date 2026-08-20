package com.knowledgeSphere.backend.repositories;

import com.knowledgeSphere.backend.entities.PublicationMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PublicationMetadataRepository
        extends JpaRepository<PublicationMetadata, Long>,
        JpaSpecificationExecutor<PublicationMetadata> {

    Optional<PublicationMetadata> findByPublicationId(String publicationId);

    List<PublicationMetadata> findAllByOrderByPublishedAtDesc();

    List<PublicationMetadata> findByUser_UserIdOrderByPublishedAtDesc(Long userId);

    List<PublicationMetadata> findAllByUser_UserIdOrderByPublishedAtDesc(Long userId);

    long countByUser_UserId(Long userId);

    List<PublicationMetadata>
    findByTitleContainingIgnoreCaseOrSubtitleContainingIgnoreCase(
            String title,
            String subtitle
    );

    List<PublicationMetadata> findByUser_UserIdInOrderByPublishedAtDesc(
            List<Long> userIds
    );
}
