package com.example.task.service;

import com.example.task.dto.AuthResponse;
import com.example.task.dto.LoginRequest;
import com.example.task.dto.RegisterRequest;
import com.example.task.dto.UserResponse;
import com.example.task.entity.Role;
import com.example.task.entity.User;
import com.example.task.repository.UserRepo;
import com.example.task.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepo userrepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepo userrepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userrepo = userrepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register user
    public UserResponse register(RegisterRequest userRequest) {

        if (userrepo.existsByEmail(userRequest.getEmail())) {
            throw new RuntimeException("User already exist");
        }

        User user = new User();

        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());

        // Encrypt password before saving
        user.setPassword(
                passwordEncoder.encode(userRequest.getPassword())
        );

        // Give every newly registered user USER role
        user.setRole(Role.USER);

        User uss = userrepo.save(user);

        return new UserResponse(
                uss.getId(),
                uss.getName(),
                uss.getEmail()
        );
    }

    // Login user
    public AuthResponse login(LoginRequest req) {

        User user = userrepo.findByEmail(req.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (!passwordEncoder.matches(
                req.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(
                token,
                user.getName(),
                user.getEmail()
        );
    }public List<UserResponse> getAllUsers() {

        return userrepo.findAll()
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                ))
                .toList();
    }
    public void deleteUser(Long id) {

        User user = userrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userrepo.delete(user);
    }public UserResponse updateRole(Long id, Role role) {

        User user = userrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);

        User updatedUser = userrepo.save(user);

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail()
        );
    }
}