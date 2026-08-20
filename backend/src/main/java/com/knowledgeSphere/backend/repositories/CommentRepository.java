package com.knowledgeSphere.backend.repositories;


import com.knowledgeSphere.backend.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository
        extends JpaRepository<Comment, Long> {

    List<Comment> findAllByPublicationId(String publicationId);
}