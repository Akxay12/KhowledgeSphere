package com.knowledgeSphere.backend.controllers;


import com.knowledgeSphere.backend.Services.UserService;
import com.knowledgeSphere.backend.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDTO dto) {

        userService.signup(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("User created successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO dto) {

        LoginResponseDTO response = userService.login(dto);

        return ResponseEntity.ok(response);
    }

    // update profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateUserDTO dto) {
        return ResponseEntity.ok(userService.updateProfile(dto));
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file) throws IOException {

        return ResponseEntity.ok(
                userService.uploadProfilePicture(file)
        );
    }


    //change Password

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequestDTO request,
            HttpServletRequest httpRequest) {

        Long userId =
                (Long) httpRequest.getAttribute("userId");

        userService.changePassword(
                userId,
                request.getNewPassword()
        );

        return ResponseEntity.ok(
                java.util.Map.of(
                        "success", true,
                        "message", "Password changed successfully"
                )
        );
    }


}
