package org.phc.templatejavabe.domain.model;

import com.mp.database.annotation.UlidSequence;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "thresholds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Threshold {
    @Id
    @UlidSequence
    @Column(name = "id", length = 26, nullable = false)
    private String id;

    @NotBlank(message = "Objective ID is required")
    @Column(name = "objective_id", length = 26, nullable = false)
    private String objectiveId;

    @NotNull(message = "Condition type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "condition_type", length = 32, nullable = false)
    private ThresholdCondition conditionType;

    @NotNull(message = "Threshold value is required")
    @DecimalMin(value = "0.0", message = "Threshold value must be non-negative")
    @Column(name = "threshold_value", precision = 19, scale = 2, nullable = false)
    private BigDecimal thresholdValue;

    @Column(name = "unit", length = 32)
    private String unit;

    @Column(name = "created_by", length = 64)
    private String createdBy;

    @Column(name = "created_date")
    private Instant createdDate;

    @Column(name = "last_modified_by", length = 64)
    private String lastModifiedBy;

    @Column(name = "last_modified_date")
    private Instant lastModifiedDate;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getObjectiveId() { return objectiveId; }
    public void setObjectiveId(String objectiveId) { this.objectiveId = objectiveId; }
    public ThresholdCondition getConditionType() { return conditionType; }
    public void setConditionType(ThresholdCondition conditionType) { this.conditionType = conditionType; }
    public BigDecimal getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(BigDecimal thresholdValue) { this.thresholdValue = thresholdValue; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedDate() { return createdDate; }
    public void setCreatedDate(Instant createdDate) { this.createdDate = createdDate; }
    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
    public Instant getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }
}
