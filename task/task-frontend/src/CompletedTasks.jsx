function CompletedTasks({ onBack }) {
    return (
        <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">

            <div className="mx-auto max-w-5xl">

                <button
                    type="button"
                    onClick={onBack}
                    className="mb-6 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                    ← Back to Dashboard
                </button>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white">
                            Completed Tasks
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Tasks that you have successfully completed.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center">

                        <div className="text-4xl">
                            ✓
                        </div>

                        <h2 className="mt-4 text-lg font-semibold">
                            Completed Tasks Page
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            We will connect your completed tasks here in the next step.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default CompletedTasks;