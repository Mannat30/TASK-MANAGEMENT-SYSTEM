import { useEffect, useState } from "react";
import api from "./api/axios";
import TaskCard from "./components/TaskCard";

function Dashboard({ onLogout }) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // =========================
    // ACTIVE PAGE
    // =========================

    const [activeView, setActiveView] = useState("dashboard");

    // =========================
    // TASKS
    // =========================

    const [tasks, setTasks] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        todo: 0,
        inProgress: 0,
        completed: 0,
    });

    // =========================
    // UI STATE
    // =========================

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);

    // =========================
    // FILTERS
    // =========================

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");

    // =========================
    // PAGINATION
    // =========================

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // =========================
    // SORTING
    // =========================

    const [sortBy, setSortBy] = useState("id");
    const [direction, setDirection] = useState("asc");

    // =========================
    // FORM
    // =========================

    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
    });

    // =========================
    // FETCH TASKS
    // =========================

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            /*
             * Dashboard + My Tasks
             * --------------------
             * Show all tasks unless the user
             * manually selects a status filter.
             *
             * Completed
             * ---------
             * Automatically request COMPLETED.
             */

            const effectiveStatus =
                activeView === "completed"
                    ? "COMPLETED"
                    : status;

            const response = await api.get("/api/tasks", {
                params: {
                    search,
                    status: effectiveStatus,
                    priority,
                    page,
                    size: 5,
                    sortBy,
                    direction,
                },
            });

            setTasks(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);

        } catch (err) {
            console.error("FETCH TASKS ERROR:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setError("Session expired. Please login again.");

                setTimeout(() => {
                    onLogout();
                }, 1200);

            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to load tasks"
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FETCH STATS
    // =========================

    const fetchStats = async () => {
        try {
            const response = await api.get("/api/tasks/stats");

            setStats({
                total: response.data.total || 0,
                todo: response.data.todo || 0,
                inProgress: response.data.inProgress || 0,
                completed: response.data.completed || 0,
            });

        } catch (err) {
            console.error("STATS ERROR:", err);
        }
    };

    // =========================
    // LOAD DATA
    // =========================

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            onLogout();
            return;
        }

        fetchTasks();
        fetchStats();

    }, [
        activeView,
        page,
        search,
        status,
        priority,
        sortBy,
        direction,
    ]);

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================
    // CREATE MODAL
    // =========================

    const openCreateModal = () => {
        setError("");
        setEditingTaskId(null);

        setForm({
            title: "",
            description: "",
            status: "TODO",
            priority: "MEDIUM",
            dueDate: "",
        });

        setShowModal(true);
    };

    // =========================
    // CREATE / UPDATE TASK
    // =========================

    const handleSubmitTask = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const taskData = {
                title: form.title,
                description: form.description,
                status: form.status,
                priority: form.priority,
                dueDate: form.dueDate || null,
            };

            if (editingTaskId) {
                await api.put(
                    `/api/tasks/${editingTaskId}`,
                    taskData
                );
            } else {
                await api.post(
                    "/api/tasks",
                    taskData
                );
            }

            setForm({
                title: "",
                description: "",
                status: "TODO",
                priority: "MEDIUM",
                dueDate: "",
            });

            setEditingTaskId(null);
            setShowModal(false);
            setPage(0);

            await fetchTasks();
            await fetchStats();

        } catch (err) {
            console.error("SAVE TASK ERROR:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setError(
                    "Access denied. JWT authentication failed."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    (
                        editingTaskId
                            ? "Failed to update task"
                            : "Failed to create task"
                    )
                );
            }

        } finally {
            setSaving(false);
        }
    };

    // =========================
    // EDIT TASK
    // =========================

    const handleEdit = (task) => {
        setError("");
        setEditingTaskId(task.id);

        setForm({
            title: task.title || "",
            description: task.description || "",
            status: task.status || "TODO",
            priority: task.priority || "MEDIUM",
            dueDate: task.dueDate || "",
        });

        setShowModal(true);
    };

    // =========================
    // DELETE TASK
    // =========================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(`/api/tasks/${id}`);

            await fetchTasks();
            await fetchStats();

        } catch (err) {
            console.error("DELETE ERROR:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setError(
                    "Access denied. JWT authentication failed."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to delete task"
                );
            }
        }
    };

    // =========================
    // CHANGE TASK STATUS
    // =========================

    const handleStatusChange = async (task, newStatus) => {
        try {
            setError("");

            const taskData = {
                title: task.title,
                description: task.description,
                status: newStatus,
                priority: task.priority,
                dueDate: task.dueDate || null,
            };

            await api.put(
                `/api/tasks/${task.id}`,
                taskData
            );

            /*
             * Refresh task list and statistics.
             *
             * Example:
             *
             * IN_PROGRESS → COMPLETED
             *
             * The task disappears from My Tasks
             * only if a filter is active.
             *
             * It will appear in Completed.
             */

            await fetchTasks();
            await fetchStats();

        } catch (err) {
            console.error("STATUS UPDATE ERROR:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setError(
                    "Access denied. JWT authentication failed."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to update task status"
                );
            }
        }
    };

    // =========================
    // NAVIGATION
    // =========================

    const openDashboard = () => {
        setActiveView("dashboard");
        setPage(0);
        setStatus("");
        setSearch("");
        setPriority("");
    };

    const openMyTasks = () => {
        setActiveView("mytasks");
        setPage(0);
        setStatus("");
        setSearch("");
        setPriority("");
    };

    const openCompleted = () => {
        setActiveView("completed");
        setPage(0);
        setStatus("");
        setSearch("");
        setPriority("");
    };

    // =========================
    // CLEAR FILTERS
    // =========================

    const clearFilters = () => {
        setSearch("");
        setStatus("");
        setPriority("");
        setSortBy("id");
        setDirection("asc");
        setPage(0);
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        onLogout();
    };

    // =========================
    // PAGE TITLE
    // =========================

    const getPageTitle = () => {
        if (activeView === "mytasks") {
            return "My Tasks";
        }

        if (activeView === "completed") {
            return "Completed Tasks";
        }

        return "Dashboard";
    };

    // =========================
    // PAGE DESCRIPTION
    // =========================

    const getPageDescription = () => {
        if (activeView === "mytasks") {
            return "Manage all your tasks in one place.";
        }

        if (activeView === "completed") {
            return "View all your completed tasks.";
        }

        return "Manage your tasks and track your progress.";
    };

    // =========================
    // RENDER
    // =========================

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 md:flex">

                {/* LOGO */}

                <div className="border-b border-slate-800 p-6">

                    <h1 className="text-2xl font-bold text-violet-400">
                        TaskFlow
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Task Management System
                    </p>

                </div>

                {/* NAVIGATION */}

                <nav className="flex-1 p-4">

                    {/* DASHBOARD */}

                    <button
                        type="button"
                        onClick={openDashboard}
                        className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition ${
                            activeView === "dashboard"
                                ? "bg-violet-600 text-white"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <span>▣</span>
                        Dashboard
                    </button>

                    {/* MY TASKS */}

                    <button
                        type="button"
                        onClick={openMyTasks}
                        className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition ${
                            activeView === "mytasks"
                                ? "bg-violet-600 text-white"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <span>✓</span>
                        My Tasks
                    </button>

                    {/* COMPLETED */}

                    <button
                        type="button"
                        onClick={openCompleted}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition ${
                            activeView === "completed"
                                ? "bg-violet-600 text-white"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <span>★</span>
                        Completed
                    </button>

                </nav>

                {/* USER */}

                <div className="border-t border-slate-800 p-4">

                    <div className="mb-4 rounded-xl bg-slate-800 p-4">

                        <p className="text-sm font-medium text-white">
                            {user.name || "User"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                            {user.email || ""}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-medium text-red-400 transition hover:bg-red-500/20"
                    >
                        Logout
                    </button>

                </div>

            </aside>

            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="md:ml-64">

                {/* HEADER */}

                <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 px-4 py-4 backdrop-blur md:px-8">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-xl font-bold text-white md:text-2xl">
                                {getPageTitle()}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {getPageDescription()}
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="rounded-xl bg-violet-600 px-4 py-2.5 font-medium text-white transition hover:bg-violet-500"
                        >
                            + New Task
                        </button>

                    </div>

                </header>

                <div className="p-4 md:p-8">

                    {/* ERROR */}

                    {error && (
                        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">

                            <span>
                                {error}
                            </span>

                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="ml-4 text-red-300 hover:text-white"
                            >
                                ✕
                            </button>

                        </div>
                    )}

                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {/* TOTAL */}

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                            <p className="text-sm text-slate-500">
                                Total Tasks
                            </p>

                            <p className="mt-2 text-3xl font-bold text-white">
                                {stats.total}
                            </p>

                        </div>

                        {/* TODO */}

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                            <p className="text-sm text-slate-500">
                                To Do
                            </p>

                            <p className="mt-2 text-3xl font-bold text-yellow-400">
                                {stats.todo}
                            </p>

                        </div>

                        {/* IN PROGRESS */}

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                            <p className="text-sm text-slate-500">
                                In Progress
                            </p>

                            <p className="mt-2 text-3xl font-bold text-blue-400">
                                {stats.inProgress}
                            </p>

                        </div>

                        {/* COMPLETED */}

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                            <p className="text-sm text-slate-500">
                                Completed
                            </p>

                            <p className="mt-2 text-3xl font-bold text-green-400">
                                {stats.completed}
                            </p>

                        </div>

                    </div>

                    {/* =================================================
                        TASK SECTION
                    ================================================= */}

                    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">

                        {/* SECTION HEADER */}

                        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">

                            <div>

                                <h3 className="text-lg font-semibold text-white">

                                    {activeView === "dashboard"
                                        ? "Recent Tasks"
                                        : activeView === "mytasks"
                                            ? "My Tasks"
                                            : "Completed Tasks"}

                                </h3>

                                <p className="text-sm text-slate-500">
                                    {totalElements} task
                                    {totalElements !== 1 ? "s" : ""}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                                Clear Filters
                            </button>

                        </div>

                        {/* FILTERS */}

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

                            {/* SEARCH */}

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Search tasks..."
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
                            />

                            {/* STATUS */}

                            <select
                                value={
                                    activeView === "completed"
                                        ? "COMPLETED"
                                        : status
                                }
                                disabled={activeView === "completed"}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="">
                                    All Status
                                </option>

                                <option value="TODO">
                                    To Do
                                </option>

                                <option value="IN_PROGRESS">
                                    In Progress
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                            </select>

                            {/* PRIORITY */}

                            <select
                                value={priority}
                                onChange={(e) => {
                                    setPriority(e.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                            >
                                <option value="">
                                    All Priorities
                                </option>

                                <option value="LOW">
                                    Low
                                </option>

                                <option value="MEDIUM">
                                    Medium
                                </option>

                                <option value="HIGH">
                                    High
                                </option>

                            </select>

                            {/* SORT */}

                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                            >
                                <option value="id">
                                    Sort: ID
                                </option>

                                <option value="title">
                                    Sort: Title
                                </option>

                                <option value="dueDate">
                                    Sort: Due Date
                                </option>

                                <option value="priority">
                                    Sort: Priority
                                </option>

                                <option value="status">
                                    Sort: Status
                                </option>

                            </select>

                            {/* DIRECTION */}

                            <select
                                value={direction}
                                onChange={(e) => {
                                    setDirection(e.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                            >
                                <option value="asc">
                                    Ascending
                                </option>

                                <option value="desc">
                                    Descending
                                </option>

                            </select>

                        </div>

                    </div>

                    {/* =================================================
                        TASK LIST
                    ================================================= */}

                    <div className="mt-6">

                        {loading ? (

                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500"></div>

                                <p className="mt-4 text-sm text-slate-500">
                                    Loading tasks...
                                </p>

                            </div>

                        ) : tasks.length === 0 ? (

                            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center">

                                <div className="text-4xl">
                                    {activeView === "completed"
                                        ? "✓"
                                        : "📝"}
                                </div>

                                <h3 className="mt-4 text-lg font-semibold text-white">

                                    {activeView === "completed"
                                        ? "No completed tasks"
                                        : "No tasks found"}

                                </h3>

                                <p className="mt-2 text-sm text-slate-500">

                                    {activeView === "completed"
                                        ? "Tasks marked as completed will appear here."
                                        : "Create a new task or change your filters."}

                                </p>

                                {activeView !== "completed" && (
                                    <button
                                        type="button"
                                        onClick={openCreateModal}
                                        className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 font-medium text-white transition hover:bg-violet-500"
                                    >
                                        Create Task
                                    </button>
                                )}

                            </div>

                        ) : (

                            <div className="space-y-4">

                                {tasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}

                            </div>

                        )}

                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {totalPages > 0 && (
                        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:flex-row">

                            <p className="text-sm text-slate-500">
                                Page {page + 1} of {totalPages}
                            </p>

                            <div className="flex items-center gap-2">

                                <button
                                    type="button"
                                    disabled={page === 0}
                                    onClick={() =>
                                        setPage((previous) =>
                                            Math.max(previous - 1, 0)
                                        )
                                    }
                                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    disabled={page >= totalPages - 1}
                                    onClick={() =>
                                        setPage((previous) =>
                                            Math.min(
                                                previous + 1,
                                                totalPages - 1
                                            )
                                        )
                                    }
                                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>

                            </div>

                        </div>
                    )}

                </div>

            </main>

            {/* =====================================================
                CREATE / EDIT MODAL
            ===================================================== */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-slate-800 p-6">

                            <div>

                                <h2 className="text-xl font-bold text-white">
                                    {editingTaskId
                                        ? "Edit Task"
                                        : "Create New Task"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {editingTaskId
                                        ? "Update your task details."
                                        : "Add a new task to your workspace."}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                            >
                                ✕
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={handleSubmitTask}
                            className="space-y-5 p-6"
                        >

                            {/* TITLE */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter task title"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
                                />

                            </div>

                            {/* DESCRIPTION */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    placeholder="Describe your task..."
                                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
                                />

                            </div>

                            {/* STATUS + PRIORITY */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                                    >
                                        <option value="TODO">
                                            To Do
                                        </option>

                                        <option value="IN_PROGRESS">
                                            In Progress
                                        </option>

                                        <option value="COMPLETED">
                                            Completed
                                        </option>

                                    </select>

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Priority
                                    </label>

                                    <select
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                                    >
                                        <option value="LOW">
                                            Low
                                        </option>

                                        <option value="MEDIUM">
                                            Medium
                                        </option>

                                        <option value="HIGH">
                                            High
                                        </option>

                                    </select>

                                </div>

                            </div>

                            {/* DUE DATE */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={form.dueDate}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                                />

                            </div>

                            {/* BUTTONS */}

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingTaskId
                                            ? "Update Task"
                                            : "Create Task"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Dashboard;