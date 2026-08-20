package com.knowledgeSphere.backend.controllers;

import com.knowledgeSphere.backend.Services.BookmarkService;
import com.knowledgeSphere.backend.Services.CommentService;
import com.knowledgeSphere.backend.Services.ResearchService;
import com.knowledgeSphere.backend.Services.UserService;
import com.knowledgeSphere.backend.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/public")
public class PublicControllers {

    private final UserService userService;
    private final ResearchService researchService;
    private final BookmarkService bookmarkService;
    private final CommentService commentService;
    public PublicControllers(UserService service,
                             ResearchService researchService,
                             BookmarkService bookmarkService,
                             CommentService commentService){
        userService=service;
        this.researchService=researchService;
        this.bookmarkService=bookmarkService;
        this.commentService=commentService;
    }

//========================= USER ================================================

    // get other users profile photo
    @GetMapping("/{userId}/picture")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable Long userId) {

        byte[] image = userService.getProfilePicture(userId);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(image);
    }

    // to view other users profile
    @GetMapping("/users/{userId}")
    public ResponseEntity<PublicUserProfileResponseDTO> getPublicUserProfile(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                userService.getPublicUserProfile(userId)
        );
    }




//====================== PUBLICATIONS ================================================
    @GetMapping("publications/{publicationId}")
    public ResponseEntity<ReadResearchResponseDTO> getResearch(
            @PathVariable String publicationId) {

        ReadResearchResponseDTO response =
                researchService.getResearch(publicationId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("publications/user/{userId}")
    public ResponseEntity<List<PublicationResponseDto>> getUserPublications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                researchService.getPublicationsByUser(userId)
        );
    }

    @GetMapping("/publications/feed")
    public ResponseEntity<List<FeedResponseDTO>> getPublicFeed() {

        return ResponseEntity.ok(
                researchService.getPublicFeed()
        );
    }


    // see commts
    @GetMapping("/comments/{publicationId}")
    public ResponseEntity<List<CommentResponseDTO>> getComments(
            @PathVariable String publicationId) {

        return ResponseEntity.ok(
                commentService.getComments(
                        publicationId
                )
        );
    }


    @GetMapping("/search")
    public ResponseEntity<List<PublicationResponseDto>> searchPublications(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String publicationType) {

        return ResponseEntity.ok(
                researchService.searchPublications(
                        category,
                        year,
                        language,
                        publicationType
                )
        );
    }



}
