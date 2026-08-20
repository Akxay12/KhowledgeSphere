package com.knowledgeSphere.backend.repositories;


import com.knowledgeSphere.backend.entities.Like;
import com.knowledgeSphere.backend.entities.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface LikeRepository
        extends JpaRepository<Like, LikeId> {

    long countByIdPublicationId(String publicationId);

    List<Like> findByIdUserId(Long userId);
}