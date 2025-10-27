package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.Group;
import org.phc.templatejavabe.presentation.response.group.GroupResponse;
import org.springframework.stereotype.Component;

@Component
public class GroupMapper {

    public static GroupResponse toResponse(Group group) {
        if (group == null) {
            return null;
        }

        GroupResponse response = new GroupResponse();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setDescription(group.getDescription());
        response.setWorkspaceId(group.getWorkspaceId());
        response.setGroupType(group.getGroupType());
        response.setSettings(group.getSettings());
        response.setStatus(group.getStatus());
        response.setCreatedDate(group.getCreatedDate() != null ? group.getCreatedDate().toString() : null);
        response.setLastModifiedDate(group.getLastModifiedDate() != null ? group.getLastModifiedDate().toString() : null);
        response.setMemberCount(group.getMemberCount());
        response.setObjectiveCount(group.getObjectiveCount());
        response.setOwnerId(group.getOwnerId());

        return response;
    }
}


