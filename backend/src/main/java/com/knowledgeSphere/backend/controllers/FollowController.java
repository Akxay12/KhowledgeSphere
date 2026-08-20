package com.knowledgeSphere.backend.controllers;


import com.knowledgeSphere.backend.Services.FollowService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(
            FollowService followService) {

        this.followService = followService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> toggleFollow(
            @PathVariable Long userId,
            HttpServletRequest request) {

        Long followerId =
                (Long) request.getAttribute("userId");

        boolean following =
                followService.toggleFollow(
                        followerId,
                        userId
                );

        return ResponseEntity.ok(
                Map.of(
                        "following", following
                )
        );
    }


    @GetMapping("/following")
    public ResponseEntity<?> getFollowing(
            HttpServletRequest request) {

        Long userId =
                (Long) request.getAttribute("userId");

        return ResponseEntity.ok(
                followService.getFollowing(userId)
        );
    }

}