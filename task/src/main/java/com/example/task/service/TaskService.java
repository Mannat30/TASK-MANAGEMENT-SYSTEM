package com.example.task.service;

import com.example.task.dto.TaskRequest;
import com.example.task.dto.TaskResponse;
import com.example.task.dto.TaskStatsResponse;
import com.example.task.entity.Priority;
import com.example.task.entity.Status;
import com.example.task.entity.Task;
import com.example.task.entity.User;
import com.example.task.repository.TaskRepo;
import com.example.task.repository.UserRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

    private final TaskRepo taskrepo;
    private final UserRepo userRepo;

    public TaskService(TaskRepo taskrepo, UserRepo userRepo) {
        this.taskrepo = taskrepo;
        this.userRepo = userRepo;
    }

    // =========================================================
    // CREATE TASK
    // =========================================================

    public TaskResponse createTask(
            TaskRequest request,
            String email
    ) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        // Status
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        } else {
            task.setStatus(Status.TODO);
        }

        // Priority
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        } else {
            task.setPriority(Priority.MEDIUM);
        }

        task.setDuedate(request.getDuedate());

        // Assign task to logged-in user
        task.setUser(user);

        Task savedTask = taskrepo.save(task);

        return convert(savedTask);
    }


    // =========================================================
    // GET TASKS
    // SEARCH + STATUS + PRIORITY + SORTING
    // =========================================================

    public Page<TaskResponse> find(
            String email,
            String search,
            String status,
            String priority,
            Pageable pageable
    ) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Clean input
        search = search == null ? "" : search.trim();
        status = status == null ? "" : status.trim();
        priority = priority == null ? "" : priority.trim();

        boolean hasSearch = !search.isEmpty();
        boolean hasStatus = !status.isEmpty();
        boolean hasPriority = !priority.isEmpty();

        // =====================================================
        // CONVERT STATUS
        // =====================================================

        Status statusEnum = null;

        if (hasStatus) {
            try {
                statusEnum = Status.valueOf(
                        status.toUpperCase()
                );
            } catch (IllegalArgumentException e) {
                throw new RuntimeException(
                        "Invalid status. Allowed values: TODO, IN_PROGRESS, COMPLETED"
                );
            }
        }

        // =====================================================
        // CONVERT PRIORITY
        // =====================================================

        Priority priorityEnum = null;

        if (hasPriority) {
            try {
                priorityEnum = Priority.valueOf(
                        priority.toUpperCase()
                );
            } catch (IllegalArgumentException e) {
                throw new RuntimeException(
                        "Invalid priority. Allowed values: LOW, MEDIUM, HIGH"
                );
            }
        }


        // =====================================================
        // NO FILTER
        // =====================================================

        if (!hasSearch && !hasStatus && !hasPriority) {

            return taskrepo
                    .findByUser(user, pageable)
                    .map(this::convert);
        }


        // =====================================================
        // SEARCH + STATUS + PRIORITY
        // =====================================================

        if (hasSearch && hasStatus && hasPriority) {

            return taskrepo
                    .findByUserAndStatusAndPriorityAndTitleContainingIgnoreCase(
                            user,
                            statusEnum,
                            priorityEnum,
                            search,
                            pageable
                    )
                    .map(this::convert);
        }


        // =====================================================
        // SEARCH + STATUS
        // =====================================================

        if (hasSearch && hasStatus) {

            return taskrepo
                    .findByUserAndStatusAndTitleContainingIgnoreCase(
                            user,
                            statusEnum,
                            search,
                            pageable
                    )
                    .map(this::convert);
        }


        // =====================================================
        // SEARCH + PRIORITY
        // =====================================================

        if (hasSearch && hasPriority) {

            return taskrepo
                    .findByUserAndPriorityAndTitleContainingIgnoreCase(
                            user,
                            priorityEnum,
                            search,
                            pageable
                    )
                    .map(this::convert);
        }


        // =====================================================
        // SEARCH ONLY
        // =====================================================

        if (hasSearch) {

            return taskrepo
                    .findByUserAndTitleContainingIgnoreCase(
                            user,
                            search,
                            pageable
                    )
                    .map(this::convert);
        }


        // =====================================================
        // STATUS + PRIORITY
        // =====================================================

        if (hasStatus && hasPriority) {

            return taskrepo
                    .findByUserAndStatusAndPriority(
                            user,
                            statusEnum,
                            priorityEnum,
                            pageable
                    )
                    .map(this::convert);
        }


        // =====================================================
        // STATUS ONLY
        // =====================================================

        if (hasStatus) {

            return taskrepo
                    .findByUserAndStatus(
                            user,
                            statusEnum,
                            pageable
                    )
                    .map(this::convert);
        }


        // =====================================================
        // PRIORITY ONLY
        // =====================================================

        if (hasPriority) {

            return taskrepo
                    .findByUserAndPriority(
                            user,
                            priorityEnum,
                            pageable
                    )
                    .map(this::convert);
        }


        // Fallback
        return taskrepo
                .findByUser(user, pageable)
                .map(this::convert);
    }


    // =========================================================
    // FIND TASK BY ID
    // =========================================================

    public TaskResponse findbyid(
            Long id,
            String email
    ) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Task task = taskrepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Task not found")
                );

        // Security check
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not allowed to access this task"
            );
        }

        return convert(task);
    }


    // =========================================================
    // UPDATE TASK
    // =========================================================

    public TaskResponse update(
            Long id,
            TaskRequest request,
            String email
    ) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Task task = taskrepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Task not found")
                );

        // Security check
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not allowed to update this task"
            );
        }

        // Update title
        task.setTitle(request.getTitle());

        // Update description
        task.setDescription(request.getDescription());

        // Update status
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        // Update priority
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        // Update due date
        task.setDuedate(request.getDuedate());

        Task updatedTask = taskrepo.save(task);

        return convert(updatedTask);
    }


    // =========================================================
    // DELETE TASK
    // =========================================================

    public void delete(
            Long id,
            String email
    ) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Task task = taskrepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Task not found")
                );

        // Security check
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not allowed to delete this task"
            );
        }

        taskrepo.delete(task);
    }


    // =========================================================
    // TASK STATISTICS
    // =========================================================

    public TaskStatsResponse getTaskStats(
            String email
    ) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        long total =
                taskrepo.countByUser(user);

        long todo =
                taskrepo.countByUserAndStatus(
                        user,
                        Status.TODO
                );

        long inProgress =
                taskrepo.countByUserAndStatus(
                        user,
                        Status.IN_PROGRESS
                );

        long completed =
                taskrepo.countByUserAndStatus(
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


    // =========================================================
    // ENTITY → RESPONSE DTO
    // =========================================================

    private TaskResponse convert(Task task) {

        TaskResponse response = new TaskResponse();

        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setDuedate(task.getDuedate());

        return response;
    }
}