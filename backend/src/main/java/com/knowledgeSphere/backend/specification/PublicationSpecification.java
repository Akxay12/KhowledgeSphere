package com.knowledgeSphere.backend.specification;

import com.knowledgeSphere.backend.entities.PublicationMetadata;
import com.knowledgeSphere.backend.Enum.PublicationType;
import com.knowledgeSphere.backend.Enum.ResearchCategory;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class PublicationSpecification {

    public static Specification<PublicationMetadata> hasCategory(
            ResearchCategory category) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("category"),
                        category
                );
    }

    public static Specification<PublicationMetadata> hasLanguage(
            String language) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(
                                root.get("language")
                        ),
                        language.toLowerCase()
                );
    }

    public static Specification<PublicationMetadata> hasPublicationType(
            PublicationType publicationType) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("publicationType"),
                        publicationType
                );
    }

    public static Specification<PublicationMetadata> publishedInYear(
            int year) {

        LocalDate startDate =
                LocalDate.of(year, 1, 1);

        LocalDate endDate =
                LocalDate.of(year + 1, 1, 1);

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.and(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("publishedAt"),
                                startDate
                        ),
                        criteriaBuilder.lessThan(
                                root.get("publishedAt"),
                                endDate
                        )
                );
    }
}
