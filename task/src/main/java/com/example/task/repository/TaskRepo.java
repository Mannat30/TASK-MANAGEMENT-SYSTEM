package com.example.task.repository;

import com.example.task.entity.Priority;
import com.example.task.entity.Status;
import com.example.task.entity.Task;
import com.example.task.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepo extends JpaRepository<Task, Long> {

    // All tasks
    Page<Task> findByUser(
            User user,
            Pageable pageable
    );

    // Search by title
    Page<Task> findByUserAndTitleContainingIgnoreCase(
            User user,
            String title,
            Pageable pageable
    );

    // Filter by status
    Page<Task> findByUserAndStatusIgnoreCase(
            User user,
            String status,
            Pageable pageable
    );

    // Search + Status
    Page<Task> findByUserAndStatusIgnoreCaseAndTitleContainingIgnoreCase(
            User user,
            String status,
            String title,
            Pageable pageable
    );

    // Filter by Priority
    Page<Task> findByUserAndPriority(
            User user,
            Priority priority,
            Pageable pageable
    );

    // Search + Priority
    Page<Task> findByUserAndPriorityAndTitleContainingIgnoreCase(
            User user,
            Priority priority,
            String title,
            Pageable pageable
    );

    // Status + Priority
    Page<Task> findByUserAndStatusIgnoreCaseAndPriority(
            User user,
            String status,
            Priority priority,
            Pageable pageable
    );

    // Search + Status + Priority
    Page<Task> findByUserAndStatusIgnoreCaseAndPriorityAndTitleContainingIgnoreCase(
            User user,
            String status,
            Priority priority,
            String title,
            Pageable pageable
    );

    long countByUser(User user);

    long countByUserAndStatus(User user, Status status);

}