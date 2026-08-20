package com.knowledgeSphere.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class ApiErrorResponse {

    private LocalDateTime timestamp;

    private int status;

    private String error;

    private String message;

    public ApiErrorResponse() {
    }

    public ApiErrorResponse(LocalDateTime timestamp,
                            int status,
                            String error,
                            String message) {

        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
    }


    public ApiErrorResponse(LocalDateTime now, int value, Object o, String noResearchFound, String message) {
    }
}