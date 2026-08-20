package com.knowledgeSphere.backend.entities;

import com.knowledgeSphere.backend.Enum.PublicationType;
import com.knowledgeSphere.backend.Enum.ResearchCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;


@Getter
@Setter
@Entity
@Table(name ="publication_metadata")
public class PublicationMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "publication_id", unique = true, nullable = false)
    private String publicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @Column(name = "cover_image_url")
    private String coverImageUrl;


    @Enumerated(EnumType.STRING)
    @Column(name = "publication_type", nullable = false)
    private PublicationType publicationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private ResearchCategory category;


    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(nullable = false)
    private String language;

    @Column(name = "published_at", nullable = false)
    private LocalDate publishedAt;

    public PublicationMetadata() {
    }
}
