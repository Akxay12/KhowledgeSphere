package com.knowledgeSphere.backend.specification;


import com.knowledgeSphere.backend.entities.PublicationMetadata;
import org.springframework.data.jpa.domain.Specification;

public class PublicationMetadataSpecification {

    public static Specification<PublicationMetadata> search(String query) {

        return (root, criteriaQuery, criteriaBuilder) -> {

            String search = "%" + query.toLowerCase() + "%";

            return criteriaBuilder.or(

                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("title")),
                            search
                    ),

                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("subtitle")),
                            search
                    ),

                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("category").as(String.class)
                            ),
                            search
                    )
            );
        };
    }
}
