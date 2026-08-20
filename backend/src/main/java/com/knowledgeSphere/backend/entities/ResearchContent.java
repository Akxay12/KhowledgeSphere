package com.knowledgeSphere.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Entity
@Table(name = "research_content")
public class ResearchContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publication_id", nullable = false, unique = true)
    private PublicationMetadata publicationMetadata;

    @Column(nullable = false,columnDefinition = "TEXT")
    private String content;

    public ResearchContent() {
    }

    // Generate Getters & Setters
}
