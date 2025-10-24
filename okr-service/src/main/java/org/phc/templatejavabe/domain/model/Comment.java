package org.phc.templatejavabe.domain.model;

import com.mp.database.annotation.UlidSequence;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @UlidSequence
    @Column(name = "id", length = 26, nullable = false)
    private String id;

    @Column(name = "objective_id", length = 26)
    private String objectiveId;

    @Column(name = "key_result_id", length = 26)
    private String keyResultId;

    @Column(name = "content", length = 2000, nullable = false)
    private String content;

    @Column(name = "author_id", length = 26, nullable = false)
    private String authorId;

    @Column(name = "created_by", length = 64)
    private String createdBy;

    @Column(name = "created_date")
    private Instant createdDate;

    @Column(name = "last_modified_by", length = 64)
    private String lastModifiedBy;

    @Column(name = "last_modified_date")
    private Instant lastModifiedDate;
}

