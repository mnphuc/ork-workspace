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
import java.util.ArrayList;
import java.util.List;

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
    @OneToMany(mappedBy = "intervalId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Objective> objectives = new ArrayList<>();

    // Helper methods
    public boolean isDateInRange(LocalDate date) {
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    public int getObjectiveCount() {
        return objectives != null ? objectives.size() : 0;
    }

    public void activate() {
        this.isActive = true;
        this.status = "ACTIVE";
    }

    public void deactivate() {
        this.isActive = false;
        this.status = "INACTIVE";
    }
}

