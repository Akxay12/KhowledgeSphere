package com.knowledgeSphere.backend.controllers;

import com.knowledgeSphere.backend.Services.ResearchService;
import com.knowledgeSphere.backend.dto.PublicationResponseDto;
import com.knowledgeSphere.backend.dto.PublishResearchRequestDTO;
import com.knowledgeSphere.backend.dto.PublishResearchResponseDTO;
import com.knowledgeSphere.backend.dto.ReadResearchResponseDTO;
import com.knowledgeSphere.backend.exceptions.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/publications")
public class ResearchController {

    private final ResearchService researchService;

    public ResearchController(ResearchService researchService){
        this.researchService=researchService;
    }

    @PostMapping("/publish")
    public ResponseEntity<?> publish(
            @RequestBody PublishResearchRequestDTO dto,
            HttpServletRequest request) {

        return ResponseEntity.ok(
                researchService.publishResearch(dto, request)
        );
    }



    // secure jwt based endpoint for user itself
    // see log in users publications
    @GetMapping("/my")
    public ResponseEntity<?> getMyPublications(HttpServletRequest request) {

        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(
                researchService.getMyPublications(userId)
        );
    }


    //delete publication(Research)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePublication(
            @PathVariable String id,
            HttpServletRequest request) {

        researchService.deletePublication(id, request);

        return ResponseEntity.ok("Deleted successfully");
    }


    //see users reseraches whome current user follows
    @GetMapping("/feed/following")
    public ResponseEntity<List<PublicationResponseDto>> getFollowingResearches(
            HttpServletRequest request
    ) {

        Long currentUserId = (Long) request.getAttribute("userId");

        if (currentUserId == null) {
            throw new UserNotFoundException("Unauthorized");
        }

        List<PublicationResponseDto> publications =
                researchService.getFollowingResearches(currentUserId);

        return ResponseEntity.ok(publications);
    }

}
