package com.example.task.controller;

import com.example.task.dto.AuthResponse;
import com.example.task.dto.LoginRequest;
import com.example.task.dto.RegisterRequest;
import com.example.task.dto.UserResponse;
import com.example.task.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/auth")
@RestController

public class UserController {
    private UserService serv;
    public UserController(UserService serv){
        this.serv=serv;
    }
     @PostMapping("/login")
    public AuthResponse Login(@Valid @RequestBody LoginRequest req){
        return serv.login(req);
    }
    @PostMapping("/register")
    public UserResponse Register(@Valid @RequestBody RegisterRequest req){
        return serv.register(req);
    }
}
