package com.knowledgeSphere.backend.repositories;

import com.knowledgeSphere.backend.entities.Bookmark;
import com.knowledgeSphere.backend.entities.BookmarkId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookmarkRepository
        extends JpaRepository<Bookmark, BookmarkId> {

    List<Bookmark> findAllByIdUserId(Long userId);
}