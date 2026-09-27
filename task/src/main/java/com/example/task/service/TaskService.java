package com.example.task.service;

import com.example.task.dto.TaskRequest;
import com.example.task.dto.TaskResponse;
import com.example.task.entity.Task;
import com.example.task.entity.User;
import com.example.task.exception.AccessDeniedException;
import com.example.task.repository.TaskRepo;
import com.example.task.repository.UserRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepo taskrepo;
    private final UserRepo userRepo;

    public TaskService(TaskRepo taskrepo, UserRepo userRepo) {
        this.taskrepo = taskrepo;
        this.userRepo = userRepo;
    }

    // Get task by ID
    public TaskResponse findbyid(Long id, String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException(
                    "You are not allowed to access this task"
            );
        }

        return convert(task);
    }

    // Get all tasks
    public Page<TaskResponse> find(
            String email,
            String search,
            String status,
            Pageable page) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasStatus = status != null && !status.isBlank();

        if (hasSearch && hasStatus) {
            return taskrepo
                    .findByUserAndStatusIgnoreCaseAndTitleContainingIgnoreCase(
                            user, status, search, page)
                    .map(this::convert);
        }

        if (hasSearch) {
            return taskrepo
                    .findByUserAndTitleContainingIgnoreCase(
                            user, search, page)
                    .map(this::convert);
        }

        if (hasStatus) {
            return taskrepo
                    .findByUserAndStatusIgnoreCase(
                            user, status, page)
                    .map(this::convert);
        }

        return taskrepo.findByUser(user, page)
                .map(this::convert);
    }

    // Create task for logged-in user
    public TaskResponse createTask(TaskRequest request, String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDesciption());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());

        // Associate task with logged-in user
        task.setUser(user);

        Task savedTask = taskrepo.save(task);

        return convert(savedTask);
    }

    // Update task
    public TaskResponse update(Long id, TaskRequest taskr, String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task tsk = taskrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!tsk.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException(
                    "You are not allowed to access this task"
            );
        }

        tsk.setDescription(taskr.getDesciption());
        tsk.setPriority(taskr.getPriority());
        tsk.setStatus(taskr.getStatus());
        tsk.setTitle(taskr.getTitle());

        Task save = taskrepo.save(tsk);

        return convert(save);
    }
    // Delete task
    public void delete(Long id, String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task tsk = taskrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!tsk.getUser().getId().equals(user.getId())) {
            throw
                    new AccessDeniedException(
                    "You are not allowed to access this task"
            );
        }

        taskrepo.delete(tsk);
    }

    // Convert Entity → Response DTO
    public TaskResponse convert(Task task) {

        return new TaskResponse(
                task.getId().intValue(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority()
        );
    }
}