package com.knowledgeSphere.backend.exceptions;

public class DuplicateUsernameException extends RuntimeException{
    public DuplicateUsernameException(String msg){
        super(msg);
    }
}
