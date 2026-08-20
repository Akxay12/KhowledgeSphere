package com.knowledgeSphere.backend.entities;


import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "likes")
@Getter
@Setter
public class Like {

    @EmbeddedId
    private LikeId id;

    public Like() {
    }

    public Like(LikeId id) {
        this.id = id;
    }
}