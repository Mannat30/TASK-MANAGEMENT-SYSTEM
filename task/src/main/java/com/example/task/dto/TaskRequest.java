package com.example.task.dto;

import com.example.task.entity.Priority;
import com.example.task.entity.Status;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class TaskRequest {
    private LocalDate duedate;

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    private Status status;

    private Priority priority;

    public TaskRequest() {
    }

    public TaskRequest(
            String title,
            String description,
            Status status,
            Priority priority,LocalDate duedate) {

        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDuedate() {
        return duedate;
    }

    public void setDuedate(LocalDate duedate) {
        this.duedate = duedate;
    }

    public String getDescription() {
        return description;
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