package com.knowledgeSphere.backend.Services;


import com.knowledgeSphere.backend.entities.Follow;
import com.knowledgeSphere.backend.entities.FollowId;
import com.knowledgeSphere.backend.repositories.FollowRepository;
import com.knowledgeSphere.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public FollowService(
            FollowRepository followRepository,
            UserRepository userRepository) {

        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public boolean toggleFollow(
            Long followerId,
            Long followingId) {

        // User khud ko follow nahi kar sakta
        if (followerId.equals(followingId)) {
            throw new RuntimeException(
                    "You cannot follow yourself"
            );
        }

        // Check karo jis user ko follow kar rahe hain
        // woh actually exist karta hai ya nahi
        if (!userRepository.existsById(followingId)) {
            throw new RuntimeException(
                    "User Not Found"
            );
        }

        FollowId followId =
                new FollowId(
                        followerId,
                        followingId
                );

        // Already following → UNFOLLOW
        if (followRepository.existsById(followId)) {

            followRepository.deleteById(followId);

            return false;
        }

        // Not following → FOLLOW
        Follow follow = new Follow();

        follow.setId(followId);

        followRepository.save(follow);

        return true;
    }


    @Transactional(readOnly = true)
    public List<Long> getFollowing(Long followerId) {

        return followRepository
                .findAllByIdFollowerId(followerId)
                .stream()
                .map(follow ->
                        follow.getId().getFollowingId()
                )
                .toList();
    }

}
