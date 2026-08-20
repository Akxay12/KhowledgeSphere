package com.knowledgeSphere.backend.controllers;

import com.knowledgeSphere.backend.Services.CommentService;
import com.knowledgeSphere.backend.dto.CommentRequestDTO;
import com.knowledgeSphere.backend.dto.CommentResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(
            CommentService commentService) {

        this.commentService = commentService;
    }





    // ================= POST COMMENT =================

    @PostMapping("{publicationId}")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable String publicationId,
            @RequestBody CommentRequestDTO request,
            HttpServletRequest httpRequest) {

        Long userId =
                (Long) httpRequest.getAttribute("userId");

        CommentResponseDTO response =
                commentService.addComment(
                        publicationId,
                        userId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            HttpServletRequest request) {

        Long userId =
                (Long) request.getAttribute("userId");

        commentService.deleteComment(
                commentId,
                userId
        );

        return ResponseEntity.ok(
                java.util.Map.of(
                        "deleted", true
                )
        );
    }
}