function TaskCard({
                      task,
                      onEdit,
                      onDelete,
                      onStatusChange
                  }) {

    // =========================
    // STATUS COLORS
    // =========================

    const getStatusClass = (status) => {

        if (status === "TODO") {
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        }

        if (status === "IN_PROGRESS") {
            return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        }

        if (status === "COMPLETED") {
            return "bg-green-500/10 text-green-400 border-green-500/20";
        }

        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    };

    // =========================
    // PRIORITY COLORS
    // =========================

    const getPriorityClass = (priority) => {

        if (priority === "HIGH") {
            return "bg-red-500/10 text-red-400 border-red-500/20";
        }

        if (priority === "MEDIUM") {
            return "bg-orange-500/10 text-orange-400 border-orange-500/20";
        }

        if (priority === "LOW") {
            return "bg-green-500/10 text-green-400 border-green-500/20";
        }

        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    };

    // =========================
    // FORMAT STATUS
    // =========================

    const formatStatus = (status) => {

        if (status === "TODO") {
            return "To Do";
        }

        if (status === "IN_PROGRESS") {
            return "In Progress";
        }

        if (status === "COMPLETED") {
            return "Completed";
        }

        return status;
    };

    // =========================
    // FORMAT PRIORITY
    // =========================

    const formatPriority = (priority) => {

        if (!priority) {
            return "Unknown";
        }

        return (
            priority.charAt(0) +
            priority.slice(1).toLowerCase()
        );
    };

    // =========================
    // STATUS CHANGE
    // =========================

    const handleStatusChange = async (e) => {

        const newStatus = e.target.value;

        console.log(
            "STATUS CHANGE:",
            task.id,
            task.status,
            "→",
            newStatus
        );

        if (!onStatusChange) {
            console.error(
                "onStatusChange is missing!"
            );
            return;
        }

        try {

            await onStatusChange(
                task,
                newStatus
            );

        } catch (error) {

            console.error(
                "STATUS CHANGE ERROR:",
                error
            );

        }
    };

    // =========================
    // UI
    // =========================

    return (
        <div
            className="
                group
                rounded-2xl
                border
                border-slate-700
                bg-slate-800/60
                p-6
                transition-all
                duration-200
                hover:border-violet-500/40
                hover:bg-slate-800
            "
        >

            <div
                className="
                    flex
                    flex-col
                    gap-5
                    lg:flex-row
                    lg:items-start
                    lg:justify-between
                "
            >

                {/* =========================
                    TASK DETAILS
                ========================= */}

                <div className="min-w-0 flex-1">

                    {/* TITLE */}

                    <div className="flex flex-wrap items-center gap-3">

                        <h3 className="break-words text-xl font-semibold text-white">
                            {task.title}
                        </h3>

                        <span className="text-xs text-slate-500">
                            #{task.id}
                        </span>

                    </div>

                    {/* DESCRIPTION */}

                    {task.description && (
                        <p className="mt-3 leading-relaxed text-slate-400">
                            {task.description}
                        </p>
                    )}

                    {/* STATUS + PRIORITY */}

                    <div className="mt-4 flex flex-wrap items-center gap-2">

                        <span
                            className={`
                                rounded-full
                                border
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                ${getStatusClass(task.status)}
                            `}
                        >
                            {formatStatus(task.status)}
                        </span>

                        <span
                            className={`
                                rounded-full
                                border
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                ${getPriorityClass(task.priority)}
                            `}
                        >
                            {formatPriority(task.priority)}
                        </span>

                    </div>

                    {/* DUE DATE */}

                    {task.dueDate && (
                        <div
                            className="
                                mt-4
                                flex
                                items-center
                                gap-2
                                text-sm
                                text-slate-500
                            "
                        >

                            <span>
                                Due date:
                            </span>

                            <span className="text-slate-300">
                                {task.dueDate}
                            </span>

                        </div>
                    )}

                    {/* =========================
                        CHANGE STATUS
                    ========================= */}

                    <div
                        className="
                            mt-5
                            flex
                            flex-wrap
                            items-center
                            gap-3
                        "
                    >

                        <label className="text-sm text-slate-500">
                            Change status:
                        </label>

                        <select
                            value={task.status}
                            onChange={handleStatusChange}
                            className="
                                rounded-lg
                                border
                                border-slate-700
                                bg-slate-950
                                px-3
                                py-2
                                text-sm
                                text-white
                                outline-none
                                transition
                                focus:border-violet-500
                            "
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

                </div>

                {/* =========================
                    ACTION BUTTONS
                ========================= */}

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        gap-2
                    "
                >

                    {/* EDIT */}

                    <button
                        type="button"
                        onClick={() => onEdit(task)}
                        className="
                            rounded-xl
                            border
                            border-blue-500/20
                            bg-blue-500/10
                            px-4
                            py-2.5
                            font-medium
                            text-blue-400
                            transition
                            hover:border-blue-500/40
                            hover:bg-blue-500/20
                        "
                    >
                        Edit
                    </button>

                    {/* DELETE */}

                    <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        className="
                            rounded-xl
                            border
                            border-red-500/20
                            bg-red-500/10
                            px-4
                            py-2.5
                            font-medium
                            text-red-400
                            transition
                            hover:border-red-500/40
                            hover:bg-red-500/20
                        "
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    );
}

export default TaskCard;