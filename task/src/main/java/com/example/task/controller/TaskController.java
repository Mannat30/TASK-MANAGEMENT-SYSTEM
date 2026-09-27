package com.example.task.controller;

import com.example.task.dto.TaskRequest;
import com.example.task.dto.TaskResponse;
import com.example.task.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.QPageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskservice;

    public TaskController(TaskService taskservice) {
        this.taskservice = taskservice;
    }

    // Get task by ID
    @GetMapping("/{id}")
    public TaskResponse findTaskById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        return taskservice.findbyid(id, email);
    }
    // Get all tasks
    @GetMapping
    public Page<TaskResponse> getAllTasks(
            Authentication authentication,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        String email = authentication.getName();

        Pageable pageable = PageRequest.of(page, size);

        return taskservice.find(
                email,
                search,
                status,
                pageable
        );
    }

    // Create task for logged-in user
    @PostMapping
    public TaskResponse create(
            @Valid @RequestBody TaskRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return taskservice.createTask(request, email);
    }

    // Update task


    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        taskservice.delete(id, email);
    }
    @PutMapping("/{id}")
    public TaskResponse update(
            @Valid @RequestBody TaskRequest task,
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        return taskservice.update(id, task, email);
    }
}