package com.knowledgeSphere.backend.Services;

import com.knowledgeSphere.backend.dto.LikeResponseDTO;
import com.knowledgeSphere.backend.entities.Like;
import com.knowledgeSphere.backend.entities.LikeId;
import com.knowledgeSphere.backend.repositories.LikeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LikeService {

    private final LikeRepository likeRepository;

    public LikeService(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    @Transactional
    public LikeResponseDTO toggleLike(
            Long userId,
            String publicationId) {

        LikeId likeId =
                new LikeId(userId, publicationId);

        boolean liked;

        // Already liked → UNLIKE
        if (likeRepository.existsById(likeId)) {

            likeRepository.deleteById(likeId);

            liked = false;

        } else {

            // Not liked → LIKE
            Like like = new Like();
            like.setId(likeId);

            likeRepository.save(like);

            liked = true;
        }

        // Latest total likes for this publication
        long likeCount =
                likeRepository.countByIdPublicationId(
                        publicationId
                );

        // Latest list of publications liked by this user
        List<String> likedPublicationIds =
                likeRepository.findByIdUserId(userId)
                        .stream()
                        .map(like ->
                                like.getId().getPublicationId()
                        )
                        .toList();

        return new LikeResponseDTO(
                liked,
                likeCount,
                likedPublicationIds
        );
    }


    public List<String> getMyLikedPublications(Long userId) {

        return likeRepository.findByIdUserId(userId)
                .stream()
                .map(like -> like.getId().getPublicationId())
                .toList();
    }

}