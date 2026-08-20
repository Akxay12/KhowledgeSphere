package com.knowledgeSphere.backend.exceptions;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResearchNotFoundException extends RuntimeException {

    public ResearchNotFoundException(String message) {
        super(message);
    }

}