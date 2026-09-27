package com.example.task.service;

import com.example.task.dto.TaskRequest;
import com.example.task.dto.TaskResponse;
import com.example.task.dto.TaskStatsResponse;
import com.example.task.entity.Priority;
import com.example.task.entity.Status;
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
            String priority,
            Pageable page) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasStatus = status != null && !status.isBlank();
        boolean hasPriority = priority != null && !priority.isBlank();

        Priority priorityEnum = null;

        if (hasPriority) {
            priorityEnum = Priority.valueOf(priority.toUpperCase());
        }

        // Search + Status + Priority
        if (hasSearch && hasStatus && hasPriority) {
            return taskrepo
                    .findByUserAndStatusIgnoreCaseAndPriorityAndTitleContainingIgnoreCase(
                            user,
                            status,
                            priorityEnum,
                            search,
                            page
                    )
                    .map(this::convert);
        }

        // Search + Status
        if (hasSearch && hasStatus) {
            return taskrepo
                    .findByUserAndStatusIgnoreCaseAndTitleContainingIgnoreCase(
                            user,
                            status,
                            search,
                            page
                    )
                    .map(this::convert);
        }

        // Search + Priority
        if (hasSearch && hasPriority) {
            return taskrepo
                    .findByUserAndPriorityAndTitleContainingIgnoreCase(
                            user,
                            priorityEnum,
                            search,
                            page
                    )
                    .map(this::convert);
        }

        // Status + Priority
        if (hasStatus && hasPriority) {
            return taskrepo
                    .findByUserAndStatusIgnoreCaseAndPriority(
                            user,
                            status,
                            priorityEnum,
                            page
                    )
                    .map(this::convert);
        }

        // Search only
        if (hasSearch) {
            return taskrepo
                    .findByUserAndTitleContainingIgnoreCase(
                            user,
                            search,
                            page
                    )
                    .map(this::convert);
        }

        // Status only
        if (hasStatus) {
            return taskrepo
                    .findByUserAndStatusIgnoreCase(
                            user,
                            status,
                            page
                    )
                    .map(this::convert);
        }

        // Priority only
        if (hasPriority) {
            return taskrepo
                    .findByUserAndPriority(
                            user,
                            priorityEnum,
                            page
                    )
                    .map(this::convert);
        }

        // No filter
        return taskrepo.findByUser(user, page)
                .map(this::convert);
    }
    // Create task for logged-in user
    public TaskResponse createTask(TaskRequest request, String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDuedate(request.getDuedate());

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

        tsk.setDescription(taskr.getDescription());
        tsk.setPriority(taskr.getPriority());
        tsk.setStatus(taskr.getStatus());
        tsk.setTitle(taskr.getTitle());
        taskr.setDuedate(taskr.getDuedate());

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
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDuedate()
        );
    }
    public TaskStatsResponse getTaskStats(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long total = taskrepo.countByUser(user);

        long todo = taskrepo.countByUserAndStatus(
                user,
                Status.TODO
        );

        long inProgress = taskrepo.countByUserAndStatus(
                user,
                Status.IN_PROGRESS
        );

        long completed = taskrepo.countByUserAndStatus(
                user,
                Status.COMPLETED
        );

        return new TaskStatsResponse(
                total,
                todo,
                inProgress,
                completed
        );
    }
}