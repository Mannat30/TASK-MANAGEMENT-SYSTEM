package com.example.task.repository;

import com.example.task.entity.Priority;
import com.example.task.entity.Status;
import com.example.task.entity.Task;
import com.example.task.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepo extends JpaRepository<Task, Long> {

    // =========================
    // BASIC TASKS
    // =========================

    Page<Task> findByUser(
            User user,
            Pageable pageable
    );

    // =========================
    // STATUS
    // =========================

    Page<Task> findByUserAndStatus(
            User user,
            Status status,
            Pageable pageable
    );

    // =========================
    // PRIORITY
    // =========================

    Page<Task> findByUserAndPriority(
            User user,
            Priority priority,
            Pageable pageable
    );

    // =========================
    // SEARCH
    // =========================

    Page<Task> findByUserAndTitleContainingIgnoreCase(
            User user,
            String title,
            Pageable pageable
    );

    // =========================
    // STATUS + PRIORITY
    // =========================

    Page<Task> findByUserAndStatusAndPriority(
            User user,
            Status status,
            Priority priority,
            Pageable pageable
    );

    // =========================
    // STATUS + SEARCH
    // =========================

    Page<Task> findByUserAndStatusAndTitleContainingIgnoreCase(
            User user,
            Status status,
            String title,
            Pageable pageable
    );

    // =========================
    // PRIORITY + SEARCH
    // =========================

    Page<Task> findByUserAndPriorityAndTitleContainingIgnoreCase(
            User user,
            Priority priority,
            String title,
            Pageable pageable
    );

    // =========================
    // STATUS + PRIORITY + SEARCH
    // =========================

    Page<Task> findByUserAndStatusAndPriorityAndTitleContainingIgnoreCase(
            User user,
            Status status,
            Priority priority,
            String title,
            Pageable pageable
    );

    // =========================
    // STATISTICS
    // =========================

    long countByUser(User user);

    long countByUserAndStatus(
            User user,
            Status status
    );
}