package com.example.task.dto;

import com.example.task.entity.Priority;
import com.example.task.entity.Status;

import java.time.LocalDate;

public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private Status status;
    private Priority priority;
    private LocalDate duedate;

    public TaskResponse() {
    }

    public TaskResponse(
            Long id,
            String title,
            String description,
            Status status,
            Priority priority,LocalDate duedate) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.duedate=duedate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDuedate(LocalDate duedate) {
        this.duedate = duedate;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }
}