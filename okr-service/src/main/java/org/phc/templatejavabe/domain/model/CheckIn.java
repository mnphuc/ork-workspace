package org.phc.templatejavabe.domain.model;

import com.mp.database.annotation.UlidSequence;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "check_ins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckIn {
    @Id
    @UlidSequence
    @Column(name = "id", length = 26, nullable = false)
    private String id;

    @NotBlank(message = "Key Result ID is required")
    @Column(name = "key_result_id", length = 26, nullable = false)
    private String keyResultId;

    @NotNull(message = "Value is required")
    @DecimalMin(value = "0.0", message = "Value must be non-negative")
    @Column(name = "value", precision = 19, scale = 2, nullable = false)
    private BigDecimal value;

    @Size(max = 1000, message = "Note must not exceed 1000 characters")
    @Column(name = "note", length = 1000)
    private String note;

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
    public String getKeyResultId() { return keyResultId; }
    public void setKeyResultId(String keyResultId) { this.keyResultId = keyResultId; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedDate() { return createdDate; }
    public void setCreatedDate(Instant createdDate) { this.createdDate = createdDate; }
    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
    public Instant getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }
}


