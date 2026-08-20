package com.knowledgeSphere.backend.controllers;


import com.knowledgeSphere.backend.Services.LikeService;
import com.knowledgeSphere.backend.dto.LikeResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/likes")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/{publicationId}")
    public ResponseEntity<LikeResponseDTO> toggleLike(
            @PathVariable String publicationId,
            HttpServletRequest request) {

        Long userId =
                (Long) request.getAttribute("userId");

        LikeResponseDTO response =
                likeService.toggleLike(
                        userId,
                        publicationId
                );

        return ResponseEntity.ok(response);
    }


    @GetMapping
    public ResponseEntity<List<String>> getMyLikedPublications(
            HttpServletRequest request) {

        Long userId =
                (Long) request.getAttribute("userId");

        List<String> publicationIds =
                likeService.getMyLikedPublications(userId);

        return ResponseEntity.ok(publicationIds);
    }

}
