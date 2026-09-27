package com.example.task.dto;

import jakarta.validation.constraints.NotBlank;

public class TaskRequest {
    @NotBlank(message="Title should not be empty")
    private String title;
    @NotBlank(message="description not be empty")
    private String description;
    @NotBlank(message="Priority not be empty")
    private String priority;
    @NotBlank(message="status not be empty")
    private String status;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDesciption() {
        return description;
    }

    public void setDesciption(String desciption) {
        this.description = desciption;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public TaskRequest(String title, String description, String priority, String status) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
    }
}
