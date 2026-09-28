# Task Management System

A full-stack Task Management System built with **Spring Boot, React, MySQL, JWT Authentication, and Docker**.

The application allows users to securely register, log in, create and manage tasks, filter and search tasks, track task progress, and view task statistics.

---

## 🚀 Features

### Authentication & Authorization

- User registration
- User login
- JWT-based authentication
- Password encryption using BCrypt
- Role-based authorization
- USER and ADMIN roles
- Protected API endpoints

### Task Management

- Create tasks
- View tasks
- View task by ID
- Update tasks
- Delete tasks
- Assign task status
- Assign task priority
- Set task due dates

### Task Status

- TODO
- IN_PROGRESS
- COMPLETED

### Task Priority

- LOW
- MEDIUM
- HIGH

### Search, Filter & Sorting

- Search tasks by title
- Filter by status
- Filter by priority
- Combine search and filters
- Sort tasks
- Ascending and descending sorting
- Pagination

### Dashboard

- Total task count
- TODO count
- In-progress count
- Completed count
- My Tasks view
- Completed Tasks view

### Admin Features

- View all users
- Delete users
- Update user roles
- Protected admin endpoints

### Docker

The complete application is containerized using Docker:

- React + Nginx
- Spring Boot
- MySQL
- Docker Compose
- Persistent MySQL volume

---

## 🛠️ Tech Stack

### Backend

- Java 25
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- Hibernate
- Maven
- Lombok
- MySQL

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios

### DevOps / Deployment

- Docker
- Docker Compose
- Nginx

---

## 🏗️ Project Architecture

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    │    React Frontend   │
                    └──────────┬──────────┘
                               │
                               │ HTTP
                               ▼
                    ┌─────────────────────┐
                    │      Nginx          │
                    │   React Production  │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │    Spring Boot      │
                    │      Backend        │
                    │                     │
                    │ JWT Authentication  │
                    │ Spring Security     │
                    │ JPA / Hibernate     │
                    └──────────┬──────────┘
                               │
                               │ JDBC
                               ▼
                    ┌─────────────────────┐
                    │       MySQL         │
                    │     Database        │
                    └─────────────────────┘
