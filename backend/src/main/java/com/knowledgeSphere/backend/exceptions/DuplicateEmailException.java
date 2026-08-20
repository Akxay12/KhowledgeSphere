package com.knowledgeSphere.backend.exceptions;

public class DuplicateEmailException extends RuntimeException{

    public DuplicateEmailException(String msg){
        super(msg);
    }

}
