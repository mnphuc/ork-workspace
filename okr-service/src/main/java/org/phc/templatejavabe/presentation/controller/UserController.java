package org.phc.templatejavabe.presentation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.phc.templatejavabe.domain.model.User;
import org.phc.templatejavabe.domain.service.UserService;
import org.phc.templatejavabe.application.mapper.UserMapper;
import org.phc.templatejavabe.presentation.response.user.UserResponse;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.findAll();
        List<UserResponse> responses = users.stream()
            .map(UserMapper::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        return userService.findById(id)
            .map(UserMapper::toResponse)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
