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
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "key_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KeyResult {
    @Id
    @UlidSequence
    @Column(name = "id", length = 26, nullable = false)
    private String id;

    @NotBlank(message = "Objective ID is required")
    @Column(name = "objective_id", length = 26, nullable = false)
    private String objectiveId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", length = 32, nullable = false)
    private MetricType metricType;

    @Size(max = 32, message = "Unit must not exceed 32 characters")
    @Column(name = "unit", length = 32)
    private String unit;

    @NotNull(message = "Target value is required")
    @DecimalMin(value = "0.0", message = "Target value must be non-negative")
    @Column(name = "target_value", precision = 19, scale = 2, nullable = false)
    private BigDecimal targetValue;

    @DecimalMin(value = "0.0", message = "Current value must be non-negative")
    @Column(name = "current_value", precision = 19, scale = 2)
    private BigDecimal currentValue;

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
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public MetricType getMetricType() { return metricType; }
    public void setMetricType(MetricType metricType) { this.metricType = metricType; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getTargetValue() { return targetValue; }
    public void setTargetValue(BigDecimal targetValue) { this.targetValue = targetValue; }
    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedDate() { return createdDate; }
    public void setCreatedDate(Instant createdDate) { this.createdDate = createdDate; }
    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
    public Instant getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }
}


