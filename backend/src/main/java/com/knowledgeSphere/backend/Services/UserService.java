package com.knowledgeSphere.backend.Services;


import com.knowledgeSphere.backend.dto.*;
import com.knowledgeSphere.backend.entities.PublicationMetadata;
import com.knowledgeSphere.backend.entities.User;
import com.knowledgeSphere.backend.exceptions.*;
import com.knowledgeSphere.backend.repositories.FollowRepository;
import com.knowledgeSphere.backend.repositories.PublicationMetadataRepository;
import com.knowledgeSphere.backend.repositories.UserRepository;
import com.knowledgeSphere.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class UserService {


    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    private final PublicationMetadataRepository publicationMetadataRepository;

    private final FollowRepository followRepository;

    public UserService(UserRepository userrepo,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       PublicationMetadataRepository publicationMetadataRepository,
                       FollowRepository followRepository){
        userRepository=userrepo;
        this.passwordEncoder=passwordEncoder;
        this.jwtUtil=jwtUtil;
        this.publicationMetadataRepository=publicationMetadataRepository;
        this.followRepository=followRepository;
    }


    public void signup(SignupRequestDTO dto){

        if(userRepository.existsByEmail(dto.getEmail())){
            throw new DuplicateEmailException("Email already exists");
        }

        if(userRepository.existsByUsername(dto.getUsername())){
            throw new DuplicateUsernameException("Username already exists");
        }

        User user = new User();

        user.setName(dto.getName());

        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());

        String hashPassword = passwordEncoder.encode(dto.getPassword());
        user.setPassword(hashPassword);

        user.setJoined(LocalDate.now());

        userRepository.save(user);
    }

    public LoginResponseDTO login(LoginRequestDTO dto){

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUserId());

        long publicationCount =
                publicationMetadataRepository
                        .countByUser_UserId(user.getUserId());

        long followersCount =
                followRepository
                        .countByIdFollowingId(user.getUserId());

        LoginResponseDTO response = new LoginResponseDTO();

        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setBio(user.getBio());
        response.setProfession(user.getProfession());
        response.setLocation(user.getLocation());
        response.setLinkedinUrl(user.getLinkedinUrl());
        response.setToken(token);
        response.setJoined(user.getJoined());
        response.setFollowersCount(followersCount);
        response.setPublicationCount(publicationCount);


        return response;
    }

    public UserProfileResponseDTO updateProfile(UpdateUserDTO dto) {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized");
        }

        Long userId = (Long) auth.getPrincipal();


        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User Not Found"));

        user.setName(dto.getName());
        user.setProfession(dto.getProfession());
        user.setBio(dto.getBio());
        user.setLocation(dto.getLocation());
        user.setLinkedinUrl(dto.getLinkedinUrl());

         userRepository.save(user);

         // getting ready to return response
        UserProfileResponseDTO response = new UserProfileResponseDTO();

        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setBio(user.getBio());
        response.setProfession(user.getProfession());
        response.setLocation(user.getLocation());
        response.setLinkedinUrl(user.getLinkedinUrl());

        return response;

    }

    public Map<String, String> uploadProfilePicture(MultipartFile file) throws IOException {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized");
        }

        Long userId = (Long) auth.getPrincipal();

        if (file.isEmpty()) {
            throw new ImageUploadException("Please select an image.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User Not Found"));

        user.setProfilePic(file.getBytes());

        userRepository.save(user);

        return Map.of("message", "Profile picture updated successfully");
    }





//=================================================================================
// ===================== PUBLIC ==============================

    public byte[] getProfilePicture(long id){

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found with id : " + id
                ));

        if (user.getProfilePic() == null) {
            throw new UserNotFoundException(
                    "Profile picture not found."
            );
        }

        return user.getProfilePic();
    }


    // to view other users profile
    public PublicUserProfileResponseDTO getPublicUserProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User Not Found")
                );

        long publicationCount =
                publicationMetadataRepository
                        .countByUser_UserId(userId);

        long followersCount =
                followRepository
                        .countByIdFollowingId(userId);

        List<PublicationMetadata> publications =
                publicationMetadataRepository
                        .findAllByUser_UserIdOrderByPublishedAtDesc(userId);

        PublicUserProfileResponseDTO response =
                new PublicUserProfileResponseDTO();

        // USER INFORMATION

        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setUsername(user.getUsername());
        response.setBio(user.getBio());
        response.setProfession(user.getProfession());
        response.setLocation(user.getLocation());
        response.setLinkedinUrl(user.getLinkedinUrl());
        response.setJoined(user.getJoined());
        response.setFollowersCount(publicationCount);
        response.setPublicationCount(publicationCount);

        // PUBLICATIONS

        List<FeedResponseDTO> publicationDTOs =
                publications.stream()
                        .map(publication -> {

                            FeedResponseDTO dto =
                                    new FeedResponseDTO();

                            dto.setPublicationId(
                                    publication.getPublicationId()
                            );

                            if (publication.getUser() != null) {
                                dto.setUserId(
                                        publication.getUser().getUserId()
                                );
                            }

                            dto.setAuthorName(
                                    publication.getAuthorName()
                            );

                            dto.setTitle(
                                    publication.getTitle()
                            );

                            dto.setSubtitle(
                                    publication.getSubtitle()
                            );

                            dto.setCoverImageUrl(
                                    publication.getCoverImageUrl()
                            );

                            dto.setPublicationType(
                                    publication.getPublicationType() != null
                                            ? publication.getPublicationType().name()
                                            : null
                            );

                            dto.setCategory(
                                    publication.getCategory() != null
                                            ? publication.getCategory().name()
                                            : null
                            );

                            dto.setLanguage(
                                    publication.getLanguage()
                            );

                            dto.setPublishedAt(
                                    publication.getPublishedAt()
                            );

                            return dto;
                        })
                        .toList();

        response.setPublications(publicationDTOs);

        return response;
    }



    //change password
    @Transactional
    public void changePassword(Long userId, String newPassword) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (newPassword == null ||
                newPassword.trim().isEmpty()) {

            throw new RuntimeException(
                    "Password cannot be empty"
            );
        }

        if (newPassword.length() < 5) {

            throw new RuntimeException(
                    "Password must be at least 5 characters"
            );
        }

        String encodedPassword =
                passwordEncoder.encode(newPassword);

        user.setPassword(encodedPassword);

        userRepository.save(user);
    }

}
