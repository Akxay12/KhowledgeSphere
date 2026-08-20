package com.knowledgeSphere.backend.Services;

import com.knowledgeSphere.backend.dto.CommentRequestDTO;
import com.knowledgeSphere.backend.dto.CommentResponseDTO;
import com.knowledgeSphere.backend.entities.Comment;
import com.knowledgeSphere.backend.entities.User;
import com.knowledgeSphere.backend.repositories.CommentRepository;
import com.knowledgeSphere.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            UserRepository userRepository) {

        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    // ================= POST COMMENT =================

    @Transactional
    public CommentResponseDTO addComment(
            String publicationId,
            Long userId,
            CommentRequestDTO request) {

        // User exist karta hai ya nahi
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User Not Found")
                );

        // Empty comment prevent karo
        if (request.getContent() == null ||
                request.getContent().trim().isEmpty()) {

            throw new RuntimeException(
                    "Comment cannot be empty"
            );
        }

        Comment comment = new Comment();

        comment.setPublicationId(publicationId);
        comment.setUserId(userId);
        comment.setContent(request.getContent().trim());

        Comment savedComment =
                commentRepository.save(comment);

        return convertToDTO(savedComment, user);
    }


    // ================= GET COMMENTS =================

    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getComments(
            String publicationId) {

        List<Comment> comments =
                commentRepository
                        .findAllByPublicationId(publicationId);

        return comments.stream()
                .map(comment -> {

                    User user =
                            userRepository
                                    .findById(comment.getUserId())
                                    .orElse(null);

                    return convertToDTO(
                            comment,
                            user
                    );
                })
                .toList();
    }


    // ================= DTO CONVERSION =================

    private CommentResponseDTO convertToDTO(
            Comment comment,
            User user) {

        CommentResponseDTO dto =
                new CommentResponseDTO();

        dto.setCommentId(comment.getId());

        dto.setUserId(comment.getUserId());

        if (user != null) {

            dto.setUsername(
                    user.getUsername()
            );

            dto.setProfilePictureUrl(
                    "/public/"
                            + user.getUserId()
                            + "/picture"
            );
        }

        dto.setContent(
                comment.getContent()
        );

        return dto;
    }

    // delete comments
    @Transactional
    public void deleteComment(Long commentId, Long userId) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new RuntimeException("Comment not found")
                );

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can delete only your own comment");
        }

        commentRepository.delete(comment);
    }
}