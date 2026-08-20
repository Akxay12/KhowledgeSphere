package com.knowledgeSphere.backend.repositories;


import com.knowledgeSphere.backend.entities.Follow;
import com.knowledgeSphere.backend.entities.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository
        extends JpaRepository<Follow, FollowId> {

    List<Follow> findAllByIdFollowerId(Long followerId);

    List<Follow> findAllByIdFollowingId(Long followingId);

    long countByIdFollowingId(Long userId);

    List<Follow> findById_FollowerId(Long followerId);
}
