package com.knowledgeSphere.backend.controllers;


import com.knowledgeSphere.backend.dto.SearchResponse;
import com.knowledgeSphere.backend.Services.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResponse> search(
            @RequestParam(required = false, defaultValue = "") String q
    ) {

        SearchResponse response = searchService.search(q);

        return ResponseEntity.ok(response);
    }
}