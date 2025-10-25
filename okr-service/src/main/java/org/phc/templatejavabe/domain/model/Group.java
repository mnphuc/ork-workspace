package org.phc.templatejavabe.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Group {
    @Id
    @Column(name = "id", length = 26)
    private String id;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "workspace_id", nullable = false, length = 26)
    private String workspaceId;

    @Column(name = "group_type", nullable = false, length = 50)
    private String groupType = "TEAM";

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
    @OneToMany(mappedBy = "groupId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GroupMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "groupId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Objective> objectives = new ArrayList<>();

    // Helper methods
    public void addMember(GroupMember member) {
        members.add(member);
        member.setGroupId(this.id);
    }

    public void removeMember(GroupMember member) {
        members.remove(member);
        member.setGroupId(null);
    }

    public int getMemberCount() {
        return members != null ? members.size() : 0;
    }

    public int getObjectiveCount() {
        return objectives != null ? objectives.size() : 0;
    }
}

