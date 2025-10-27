package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.GroupMember;
import org.phc.templatejavabe.domain.model.User;
import org.phc.templatejavabe.presentation.response.group.GroupMemberResponse;
import org.springframework.stereotype.Component;

@Component
public class GroupMemberMapper {

    public static GroupMemberResponse toResponse(GroupMember member, User user) {
        if (member == null) {
            return null;
        }

        GroupMemberResponse response = new GroupMemberResponse();
        response.setId(member.getId());
        response.setUserId(member.getUserId());
        response.setRole(member.getRole());
        response.setPermissions(member.getPermissions());
        response.setJoinedDate(member.getJoinedDate() != null ? member.getJoinedDate().toString() : null);
        response.setLastActivity(member.getLastActivity() != null ? member.getLastActivity().toString() : null);

        // Set user information if available
        if (user != null) {
            response.setUserEmail(user.getEmail());
            response.setFullName(user.getFullName());
            response.setAvatarUrl(user.getAvatarUrl());
        }

        return response;
    }
}


