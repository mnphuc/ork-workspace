package org.phc.templatejavabe.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "objective_alignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ObjectiveAlignment {
    @EmbeddedId
    private ObjectiveAlignmentId id;

    @Column(name = "created_by", length = 64)
    private String createdBy;
}


