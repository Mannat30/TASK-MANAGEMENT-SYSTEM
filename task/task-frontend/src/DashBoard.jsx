import { useEffect, useState } from "react";
import api from "./api/axios";

function Dashboard({ onLogout }) {

    // =========================
    // USER
    // =========================

    const user = JSON.parse(localStorage.getItem("user") || "{}");


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
    // UI STATES
    // =========================

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);

    // null = create mode
    // id = edit mode
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


    // =========================================================
    // FETCH TASKS
    // =========================================================

    const fetchTasks = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/api/tasks", {
                params: {
                    search,
                    status,
                    priority,
                    page,
                    size: 5,
                    sortBy,
                    direction,
                },
            });

            console.log("TASK RESPONSE:", response.data);

            setTasks(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);

        } catch (err) {

            console.error("FETCH TASK ERROR:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                setError("Session expired. Please login again.");

                setTimeout(() => {
                    onLogout();
                }, 1200);

            } else {

                setError("Failed to load tasks");

            }

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // FETCH STATS
    // =========================================================

    const fetchStats = async () => {

        try {

            const response = await api.get("/api/tasks/stats");

            console.log("STATS:", response.data);

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


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            onLogout();
            return;
        }

        fetchTasks();
        fetchStats();

    }, [
        page,
        search,
        status,
        priority,
        sortBy,
        direction,
    ]);


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // =========================================================
    // OPEN CREATE MODAL
    // =========================================================

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


    // =========================================================
    // CREATE / UPDATE TASK
    // =========================================================

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

            console.log("TASK DATA:", taskData);


            // =========================
            // UPDATE
            // =========================

            if (editingTaskId) {

                console.log(
                    "UPDATING TASK:",
                    editingTaskId
                );

                await api.put(
                    `/api/tasks/${editingTaskId}`,
                    taskData
                );

            }

                // =========================
                // CREATE
            // =========================

            else {

                console.log(
                    "CREATING TASK:",
                    taskData
                );

                await api.post(
                    "/api/tasks",
                    taskData
                );

            }


            // =========================
            // RESET FORM
            // =========================

            setForm({
                title: "",
                description: "",
                status: "TODO",
                priority: "MEDIUM",
                dueDate: "",
            });

            setEditingTaskId(null);

            setShowModal(false);


            // =========================
            // REFRESH DATA
            // =========================

            setPage(0);

            await fetchTasks();
            await fetchStats();


        } catch (err) {

            console.error(
                "SAVE TASK ERROR:",
                err
            );


            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                setError(
                    "Access denied. JWT authentication failed."
                );

                return;
            }


            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else {

                setError(
                    editingTaskId
                        ? "Failed to update task"
                        : "Failed to create task"
                );

            }

        } finally {

            setSaving(false);

        }
    };


    // =========================================================
    // EDIT TASK
    // =========================================================

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


    // =========================================================
    // DELETE TASK
    // =========================================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }


        try {

            setError("");

            await api.delete(
                `/api/tasks/${id}`
            );

            console.log(
                "TASK DELETED:",
                id
            );


            // Refresh
            await fetchTasks();
            await fetchStats();


        } catch (err) {

            console.error(
                "DELETE TASK ERROR:",
                err
            );


            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                setError(
                    "Access denied. JWT authentication failed."
                );

                return;
            }


            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else {

                setError(
                    "Failed to delete task"
                );

            }

        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        onLogout();
    };


    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = () => {

        setSearch("");

        setStatus("");

        setPriority("");

        setSortBy("id");

        setDirection("asc");

        setPage(0);
    };


    // =========================================================
    // STATUS BADGE
    // =========================================================

    const getStatusClass = (taskStatus) => {

        if (taskStatus === "TODO") {

            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

        }

        if (taskStatus === "IN_PROGRESS") {

            return "bg-blue-500/10 text-blue-400 border-blue-500/20";

        }

        return "bg-green-500/10 text-green-400 border-green-500/20";
    };


    // =========================================================
    // PRIORITY BADGE
    // =========================================================

    const getPriorityClass = (taskPriority) => {

        if (taskPriority === "HIGH") {

            return "bg-red-500/10 text-red-400 border-red-500/20";

        }

        if (taskPriority === "MEDIUM") {

            return "bg-orange-500/10 text-orange-400 border-orange-500/20";

        }

        return "bg-green-500/10 text-green-400 border-green-500/20";
    };


    // =========================================================
    // RETURN UI
    // =========================================================

    return (

        <div className="min-h-screen bg-slate-950 text-white flex">


            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <aside className="w-72 bg-slate-900 border-r border-slate-800 min-h-screen flex flex-col">


                {/* LOGO */}

                <div className="p-7">

                    <h1 className="text-3xl font-bold">

                        Task
                        <span className="text-violet-500">
                            Flow
                        </span>

                    </h1>

                    <p className="text-slate-500 text-sm mt-2">
                        Task Management System
                    </p>

                </div>


                {/* NAVIGATION */}

                <nav className="px-5 space-y-2">


                    {/* DASHBOARD */}

                    <button
                        className="w-full text-left px-5 py-4 rounded-xl bg-violet-600 text-white font-semibold"
                    >
                        Dashboard
                    </button>


                    {/* MY TASKS */}

                    <button
                        onClick={() => {

                            document
                                .getElementById("tasks-section")
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                });

                        }}
                        className="w-full text-left px-5 py-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    >

                        My Tasks

                    </button>


                    {/* COMPLETED */}

                    <button
                        onClick={() => {

                            setStatus("COMPLETED");

                            setPage(0);

                            document
                                .getElementById("tasks-section")
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                });

                        }}
                        className="w-full text-left px-5 py-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    >

                        Completed

                    </button>

                </nav>


                {/* USER / LOGOUT */}

                <div className="mt-auto p-5">

                    <div className="border-t border-slate-800 pt-5 mb-4">

                        <p className="text-sm text-slate-400">
                            Logged in as
                        </p>

                        <p className="text-white font-semibold truncate">

                            {user.name ||
                                user.email ||
                                "User"}

                        </p>

                    </div>


                    <button
                        onClick={handleLogout}
                        className="w-full px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition"
                    >

                        Logout

                    </button>

                </div>

            </aside>


            {/* =====================================================
                MAIN
            ====================================================== */}

            <main className="flex-1 p-10 overflow-auto">


                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="flex justify-between items-center mb-10">


                    <div>

                        <h2 className="text-4xl font-bold">
                            Dashboard
                        </h2>

                        <p className="text-slate-400 mt-2">
                            Manage your tasks and track your progress.
                        </p>

                    </div>


                    {/* NEW TASK */}

                    <button
                        onClick={openCreateModal}
                        className="bg-violet-600 hover:bg-violet-700 px-6 py-4 rounded-xl font-semibold transition shadow-lg shadow-violet-900/20"
                    >

                        + New Task

                    </button>

                </div>


                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl">

                        {error}

                    </div>

                )}


                {/* =================================================
                    STATS
                ================================================== */}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">


                    {/* TOTAL */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">

                        <p className="text-slate-400">
                            Total Tasks
                        </p>

                        <p className="text-4xl font-bold mt-4">
                            {stats.total}
                        </p>

                    </div>


                    {/* TODO */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">

                        <p className="text-slate-400">
                            To Do
                        </p>

                        <p className="text-4xl font-bold text-yellow-400 mt-4">
                            {stats.todo}
                        </p>

                    </div>


                    {/* IN PROGRESS */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">

                        <p className="text-slate-400">
                            In Progress
                        </p>

                        <p className="text-4xl font-bold text-blue-400 mt-4">
                            {stats.inProgress}
                        </p>

                    </div>


                    {/* COMPLETED */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">

                        <p className="text-slate-400">
                            Completed
                        </p>

                        <p className="text-4xl font-bold text-green-400 mt-4">
                            {stats.completed}
                        </p>

                    </div>

                </div>


                {/* =================================================
                    TASK SECTION
                ================================================== */}

                <section
                    id="tasks-section"
                    className="bg-slate-900 border border-slate-800 rounded-2xl"
                >


                    {/* TASK HEADER */}

                    <div className="p-7 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5">


                        <div>

                            <h3 className="text-2xl font-bold">
                                My Tasks
                            </h3>

                            <p className="text-slate-500 mt-1">

                                {totalElements} tasks

                            </p>

                        </div>


                        {/* SEARCH */}

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {

                                setSearch(e.target.value);

                                setPage(0);

                            }}
                            placeholder="Search tasks..."
                            className="w-full lg:w-80 bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-white outline-none focus:border-violet-500"
                        />

                    </div>


                    {/* =================================================
                        FILTERS
                    ================================================== */}

                    <div className="p-6 border-b border-slate-800 flex flex-wrap gap-3">


                        {/* STATUS */}

                        <select
                            value={status}
                            onChange={(e) => {

                                setStatus(e.target.value);

                                setPage(0);

                            }}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
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
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
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
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
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
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                        >

                            <option value="asc">
                                Ascending
                            </option>

                            <option value="desc">
                                Descending
                            </option>

                        </select>


                        {/* CLEAR */}

                        <button
                            onClick={clearFilters}
                            className="px-5 py-3 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800"
                        >

                            Clear

                        </button>

                    </div>


                    {/* =================================================
                        TASK LIST
                    ================================================== */}

                    <div className="p-6">


                        {/* LOADING */}

                        {loading ? (

                                <div className="text-center py-20 text-slate-400">

                                    Loading tasks...

                                </div>

                            )


                            /* NO TASKS */

                            : tasks.length === 0 ? (

                                    <div className="text-center py-20">


                                        <div className="text-5xl mb-5">
                                            ✓
                                        </div>


                                        <h3 className="text-xl font-semibold">
                                            No tasks found
                                        </h3>


                                        <p className="text-slate-500 mt-2">
                                            Create your first task to get started.
                                        </p>


                                        <button
                                            onClick={openCreateModal}
                                            className="mt-6 bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-lg font-semibold"
                                        >

                                            Create Task

                                        </button>

                                    </div>

                                )


                                /* TASKS */

                                : (

                                    <div className="space-y-4">

                                        {tasks.map((task) => (

                                            <div
                                                key={task.id}
                                                className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 hover:border-violet-500/40 transition"
                                            >

                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">


                                                    {/* TASK DETAILS */}

                                                    <div className="flex-1">


                                                        {/* TITLE + BADGES */}

                                                        <div className="flex items-center gap-3 flex-wrap">


                                                            <h4 className="text-lg font-semibold">

                                                                {task.title}

                                                            </h4>


                                                            {/* STATUS */}

                                                            <span
                                                                className={`px-3 py-1 text-xs rounded-full border ${getStatusClass(task.status)}`}
                                                            >

                                                        {task.status}

                                                    </span>


                                                            {/* PRIORITY */}

                                                            <span
                                                                className={`px-3 py-1 text-xs rounded-full border ${getPriorityClass(task.priority)}`}
                                                            >

                                                        {task.priority}

                                                    </span>

                                                        </div>


                                                        {/* DESCRIPTION */}

                                                        <p className="text-slate-400 mt-2">

                                                            {task.description}

                                                        </p>


                                                        {/* DUE DATE */}

                                                        {task.dueDate && (

                                                            <p className="text-sm text-slate-500 mt-3">

                                                                Due: {task.dueDate}

                                                            </p>

                                                        )}

                                                    </div>


                                                    {/* RIGHT SIDE */}

                                                    <div className="flex flex-col items-end gap-3">


                                                        {/* ID */}

                                                        <div className="text-slate-500 text-sm">

                                                            #{task.id}

                                                        </div>


                                                        {/* ACTION BUTTONS */}

                                                        <div className="flex gap-2">


                                                            {/* EDIT */}

                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(task)
                                                                }
                                                                className="px-4 py-2 text-sm rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition"
                                                            >

                                                                Edit

                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(task.id)
                                                                }
                                                                className="px-4 py-2 text-sm rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                                                            >

                                                                Delete

                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                    </div>


                    {/* =================================================
                        PAGINATION
                    ================================================== */}

                    {totalPages > 1 && (

                        <div className="px-6 pb-6 flex justify-center items-center gap-4">


                            {/* PREVIOUS */}

                            <button
                                disabled={page === 0}
                                onClick={() =>
                                    setPage((p) => p - 1)
                                }
                                className="px-5 py-2 bg-slate-800 rounded-lg disabled:opacity-40"
                            >

                                Previous

                            </button>


                            {/* PAGE NUMBER */}

                            <span className="text-slate-400">

                                Page {page + 1} of {totalPages}

                            </span>


                            {/* NEXT */}

                            <button
                                disabled={
                                    page >= totalPages - 1
                                }
                                onClick={() =>
                                    setPage((p) => p + 1)
                                }
                                className="px-5 py-2 bg-slate-800 rounded-lg disabled:opacity-40"
                            >

                                Next

                            </button>

                        </div>

                    )}

                </section>

            </main>


            {/* =====================================================
                CREATE / EDIT TASK MODAL
            ====================================================== */}

            {showModal && (

                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">


                    <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">


                        {/* MODAL HEADER */}

                        <div className="p-7 border-b border-slate-800 flex justify-between items-center">


                            <div>

                                <h2 className="text-2xl font-bold">

                                    {editingTaskId
                                        ? "Edit Task"
                                        : "Create Task"
                                    }

                                </h2>


                                <p className="text-slate-500 mt-1">

                                    {editingTaskId
                                        ? "Update your task details."
                                        : "Add a new task to your workspace."
                                    }

                                </p>

                            </div>


                            {/* CLOSE */}

                            <button
                                onClick={() => {

                                    setShowModal(false);

                                    setEditingTaskId(null);

                                }}
                                className="text-slate-500 hover:text-white text-2xl"
                            >

                                ×

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={handleSubmitTask}
                            className="p-7 space-y-5"
                        >


                            {/* TITLE */}

                            <div>

                                <label className="block text-slate-300 mb-2">

                                    Title

                                </label>

                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-violet-500"
                                    placeholder="Enter task title"
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div>

                                <label className="block text-slate-300 mb-2">

                                    Description

                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-violet-500 resize-none"
                                    placeholder="Describe your task"
                                />

                            </div>


                            {/* STATUS + PRIORITY */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                                {/* STATUS */}

                                <div>

                                    <label className="block text-slate-300 mb-2">

                                        Status

                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                                    >

                                        <option value="TODO">
                                            TODO
                                        </option>

                                        <option value="IN_PROGRESS">
                                            IN PROGRESS
                                        </option>

                                        <option value="COMPLETED">
                                            COMPLETED
                                        </option>

                                    </select>

                                </div>


                                {/* PRIORITY */}

                                <div>

                                    <label className="block text-slate-300 mb-2">

                                        Priority

                                    </label>

                                    <select
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                                    >

                                        <option value="LOW">
                                            LOW
                                        </option>

                                        <option value="MEDIUM">
                                            MEDIUM
                                        </option>

                                        <option value="HIGH">
                                            HIGH
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* DUE DATE */}

                            <div>

                                <label className="block text-slate-300 mb-2">

                                    Due Date

                                </label>

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={form.dueDate}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                                />

                            </div>


                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 pt-3">


                                {/* CANCEL */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        setShowModal(false);

                                        setEditingTaskId(null);

                                    }}
                                    className="px-5 py-3 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800"
                                >

                                    Cancel

                                </button>


                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg font-semibold"
                                >

                                    {saving
                                        ? (
                                            editingTaskId
                                                ? "Updating..."
                                                : "Creating..."
                                        )
                                        : (
                                            editingTaskId
                                                ? "Update Task"
                                                : "Create Task"
                                        )
                                    }

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