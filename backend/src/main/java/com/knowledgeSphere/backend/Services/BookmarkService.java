package com.knowledgeSphere.backend.Services;

import com.knowledgeSphere.backend.entities.Bookmark;
import com.knowledgeSphere.backend.entities.BookmarkId;

import com.knowledgeSphere.backend.repositories.BookmarkRepository;
import com.knowledgeSphere.backend.repositories.PublicationMetadataRepository;
import com.knowledgeSphere.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;

    public BookmarkService(BookmarkRepository bookmarkRepository) {
        this.bookmarkRepository = bookmarkRepository;
    }

    @Transactional
    public boolean toggleBookmark(
            Long userId,
            String publicationId) {

        BookmarkId bookmarkId =
                new BookmarkId(userId, publicationId);

        if (bookmarkRepository.existsById(bookmarkId)) {

            bookmarkRepository.deleteById(bookmarkId);

            return false;
        }

        Bookmark bookmark = new Bookmark();
        bookmark.setId(bookmarkId);

        bookmarkRepository.save(bookmark);

        return true;
    }


    @Transactional(readOnly = true)
    public List<String> getMyBookmarks(Long userId) {

        return bookmarkRepository
                .findAllByIdUserId(userId)
                .stream()
                .map(bookmark ->
                        bookmark.getId().getPublicationId()
                )
                .toList();
    }

}
