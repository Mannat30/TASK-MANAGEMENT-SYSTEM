package com.example.task.controller;

import com.example.task.dto.UserResponse;
import com.example.task.entity.Role;
import com.example.task.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
    @PutMapping("/users/{id}/role")
    public UserResponse updateRole(
            @PathVariable Long id,
            @RequestBody Role role) {

        return userService.updateRole(id, role);
    }
}