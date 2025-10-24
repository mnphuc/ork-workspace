package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.User;
import org.phc.templatejavabe.presentation.response.user.UserResponse;

public class UserMapper {
    public static UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getAvatarUrl(), 
            u.getStatus() != null ? u.getStatus().name() : null);
    }
}



