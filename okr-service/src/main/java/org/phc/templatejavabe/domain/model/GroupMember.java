package org.phc.templatejavabe.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {
    @Id
    @Column(name = "id", length = 26)
    private String id;

    @Column(name = "group_id", nullable = false, length = 26)
    private String groupId;

    @Column(name = "user_id", nullable = false, length = 26)
    private String userId;

    @Column(name = "role", nullable = false, length = 50)
    private String role = "MEMBER";

    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

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

    @Column(name = "joined_date", nullable = false)
    private LocalDateTime joinedDate;

    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", insertable = false, updatable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    // Helper methods
    public void updateLastActivity() {
        this.lastActivity = LocalDateTime.now();
    }
}


