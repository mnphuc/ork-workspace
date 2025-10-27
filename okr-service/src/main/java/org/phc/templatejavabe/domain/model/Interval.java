package org.phc.templatejavabe.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "intervals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Interval {
    @Id
    @Column(name = "id", length = 26)
    private String id;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "workspace_id", nullable = false, length = 26)
    private String workspaceId;

    @Column(name = "interval_type", nullable = false, length = 50)
    private String intervalType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @Column(name = "settings", columnDefinition = "TEXT")
    private String settings;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_by", nullable = false, length = 26)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "last_modified_by", length = 26)
    private String lastModifiedBy;

    @UpdateTimestamp
    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;

    @Column(name = "owner_id", nullable = false, length = 26)
    private String ownerId;

    // Relationships
    // Note: Objectives are not directly related to intervals through a foreign key
    // The relationship is conceptual through quarters or date ranges

    // Helper methods
    public boolean isDateInRange(LocalDate date) {
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    // Note: Objective count would need to be calculated through business logic
    // based on quarters or date ranges, not through a direct relationship

    public void activate() {
        this.isActive = true;
        this.status = "ACTIVE";
    }

    public void deactivate() {
        this.isActive = false;
        this.status = "INACTIVE";
    }
}

