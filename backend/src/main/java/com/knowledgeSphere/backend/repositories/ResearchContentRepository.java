package com.knowledgeSphere.backend.repositories;

import com.knowledgeSphere.backend.entities.PublicationMetadata;
import com.knowledgeSphere.backend.entities.ResearchContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;


public interface ResearchContentRepository
        extends JpaRepository<ResearchContent, Long> {

    Optional<ResearchContent> findByPublicationMetadata(PublicationMetadata publicationMetadata);

    @Modifying
    @Transactional
    void deleteByPublicationMetadata_PublicationId(String publicationId);
}