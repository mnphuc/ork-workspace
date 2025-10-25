package org.phc.templatejavabe.domain.service;

import org.phc.templatejavabe.domain.model.Group;
import org.phc.templatejavabe.domain.model.GroupMember;
import org.phc.templatejavabe.domain.model.User;
import org.phc.templatejavabe.infrastructure.repository.GroupRepository;
import org.phc.templatejavabe.infrastructure.repository.GroupMemberRepository;
import org.phc.templatejavabe.domain.repository.UserRepository;
import org.phc.templatejavabe.presentation.request.group.*;
import org.phc.templatejavabe.presentation.response.group.*;
import org.phc.templatejavabe.application.mapper.GroupMapper;
import org.phc.templatejavabe.application.mapper.GroupMemberMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupService {

    private static final Logger logger = LoggerFactory.getLogger(GroupService.class);

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserRepository userRepository;

    public GroupResponse createGroup(CreateGroupRequest request, String userId) {
        logger.info("Creating group: {} for workspace: {} by user: {}", request.getName(), request.getWorkspaceId(), userId);

        // Check if group name already exists in workspace
        if (groupRepository.existsByNameAndWorkspaceId(request.getName(), request.getWorkspaceId())) {
            throw new RuntimeException("Group with name '" + request.getName() + "' already exists in this workspace");
        }

        // Create group
        Group group = new Group();
        group.setId(generateId());
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setWorkspaceId(request.getWorkspaceId());
        group.setGroupType(request.getGroupType());
        group.setSettings(request.getSettings());
        group.setStatus("ACTIVE");
        group.setCreatedBy(userId);
        group.setOwnerId(userId);

        Group savedGroup = groupRepository.save(group);
        logger.info("Group created successfully: {}", savedGroup.getId());

        return GroupMapper.toResponse(savedGroup);
    }

    public List<GroupResponse> getGroups(String workspaceId, String userId) {
        logger.info("Getting groups for workspace: {} by user: {}", workspaceId, userId);

        List<Group> groups;
        if (workspaceId != null) {
            groups = groupRepository.findByWorkspaceIdAndStatusOrderByCreatedDateDesc(workspaceId, "ACTIVE");
        } else {
            groups = groupRepository.findActiveGroupsByOwner(userId);
        }

        return groups.stream()
                .map(GroupMapper::toResponse)
                .collect(Collectors.toList());
    }

    public GroupResponse getGroup(String id, String userId) {
        logger.info("Getting group: {} by user: {}", id, userId);

        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if user has access to this group's workspace
        // This would typically involve checking workspace membership
        // For now, we'll just return the group

        return GroupMapper.toResponse(group);
    }

    public GroupResponse updateGroup(String id, UpdateGroupRequest request, String userId) {
        logger.info("Updating group: {} by user: {}", id, userId);

        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if user has permission to update this group
        if (!group.getOwnerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this group");
        }

        // Update fields
        if (request.getName() != null) {
            // Check if new name already exists in workspace
            if (!request.getName().equals(group.getName()) && 
                groupRepository.existsByNameAndWorkspaceId(request.getName(), group.getWorkspaceId())) {
                throw new RuntimeException("Group with name '" + request.getName() + "' already exists in this workspace");
            }
            group.setName(request.getName());
        }
        if (request.getDescription() != null) {
            group.setDescription(request.getDescription());
        }
        if (request.getGroupType() != null) {
            group.setGroupType(request.getGroupType());
        }
        if (request.getSettings() != null) {
            group.setSettings(request.getSettings());
        }
        group.setLastModifiedBy(userId);

        Group updatedGroup = groupRepository.save(group);
        logger.info("Group updated successfully: {}", id);

        return GroupMapper.toResponse(updatedGroup);
    }

    public void deleteGroup(String id, String userId) {
        logger.info("Deleting group: {} by user: {}", id, userId);

        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if user has permission to delete this group
        if (!group.getOwnerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this group");
        }

        // Soft delete
        group.setStatus("DELETED");
        group.setLastModifiedBy(userId);
        groupRepository.save(group);

        logger.info("Group deleted successfully: {}", id);
    }

    public GroupMemberResponse addMember(String groupId, AddMemberRequest request, String userId) {
        logger.info("Adding member '{}' to group: {} by user: {}", request.getUserEmail(), groupId, userId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if user has permission to add members
        if (!group.getOwnerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to add members to this group");
        }

        // Find user by email
        User user = userRepository.findByEmail(request.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getUserEmail()));

        // Check if user is already a member
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new RuntimeException("User is already a member of this group");
        }

        // Create group member
        GroupMember member = new GroupMember();
        member.setId(generateId());
        member.setGroupId(groupId);
        member.setUserId(user.getId());
        member.setRole(request.getRole());
        member.setPermissions(request.getPermissions());
        member.setStatus("ACTIVE");
        member.setCreatedBy(userId);
        member.setJoinedDate(LocalDateTime.now());

        GroupMember savedMember = groupMemberRepository.save(member);
        logger.info("Member added successfully to group: {}", groupId);

        return GroupMemberMapper.toResponse(savedMember, user);
    }

    public void removeMember(String groupId, String memberId, String userId) {
        logger.info("Removing member: {} from group: {} by user: {}", memberId, groupId, userId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if user has permission to remove members
        if (!group.getOwnerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to remove members from this group");
        }

        GroupMember member = groupMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Group member not found"));

        if (!member.getGroupId().equals(groupId)) {
            throw new RuntimeException("Member does not belong to this group");
        }

        // Soft delete
        member.setStatus("REMOVED");
        member.setLastModifiedBy(userId);
        groupMemberRepository.save(member);

        logger.info("Member removed successfully from group: {}", groupId);
    }

    public List<GroupMemberResponse> getGroupMembers(String groupId, String userId) {
        logger.info("Getting members for group: {} by user: {}", groupId, userId);

        // Check if group exists
        if (!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group not found");
        }

        // Check if user has access to this group
        // This would typically involve checking workspace membership
        // For now, we'll just return the members

        List<GroupMember> members = groupMemberRepository.findActiveMembersByGroup(groupId);
        
        return members.stream()
                .map(member -> {
                    User user = userRepository.findById(member.getUserId()).orElse(null);
                    return GroupMemberMapper.toResponse(member, user);
                })
                .collect(Collectors.toList());
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 26);
    }
}
