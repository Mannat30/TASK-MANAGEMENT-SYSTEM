package com.example.task.repository;

import com.example.task.entity.Task;
import com.example.task.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface TaskRepo extends JpaRepository<Task, Long> {

    Page<Task> findByUser(User user, Pageable pageable);

    Page<Task> findByUserAndTitleContainingIgnoreCase(
            User user,
            String title,
            Pageable pageable
    );

    Page<Task> findByUserAndStatusIgnoreCase(
            User user,
            String status,
            Pageable pageable
    );

    Page<Task> findByUserAndStatusIgnoreCaseAndTitleContainingIgnoreCase(
            User user,
            String status,
            String title,
            Pageable pageable
    );
}
