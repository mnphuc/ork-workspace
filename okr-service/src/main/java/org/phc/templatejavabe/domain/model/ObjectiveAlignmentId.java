package org.phc.templatejavabe.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ObjectiveAlignmentId implements Serializable {
    @Column(name = "parent_objective_id", length = 26, nullable = false)
    private String parentObjectiveId;
    @Column(name = "child_objective_id", length = 26, nullable = false)
    private String childObjectiveId;
}


