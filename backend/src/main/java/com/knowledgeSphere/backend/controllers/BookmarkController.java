package com.knowledgeSphere.backend.controllers;

import com.knowledgeSphere.backend.Services.BookmarkService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
    @RequestMapping("/bookmarks")
    public class BookmarkController {

        private final BookmarkService bookmarkService;

        public BookmarkController(BookmarkService bookmarkService) {
            this.bookmarkService = bookmarkService;
        }

        @PostMapping("/{publicationId}")
        public ResponseEntity<?> toggleBookmark(
                @PathVariable String publicationId,
                HttpServletRequest request) {

            Long userId =
                    (Long) request.getAttribute("userId");

            boolean bookmarked =
                    bookmarkService.toggleBookmark(
                            userId,
                            publicationId
                    );

            return ResponseEntity.ok(
                    java.util.Map.of(
                            "bookmarked", bookmarked
                    )
            );
        }


        @GetMapping
        public ResponseEntity<?> getMyBookmarks(
                HttpServletRequest request) {

            Long userId =
                    (Long) request.getAttribute("userId");

            return ResponseEntity.ok(
                    bookmarkService.getMyBookmarks(userId)
            );
        }

}


