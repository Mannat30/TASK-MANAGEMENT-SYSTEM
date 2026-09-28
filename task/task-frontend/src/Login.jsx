import { useState } from "react";
import api from "./api/axios";

function Login({ onLogin, onRegister }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post("/api/auth/login", {
                email,
                password,
            });

            console.log("LOGIN RESPONSE:", response.data);

            if (!response.data.token) {
                throw new Error("JWT token not received from backend");
            }

            // Save JWT
            localStorage.setItem("token", response.data.token);

            localStorage.setItem(
                "user",
                JSON.stringify({
                    name: response.data.name,
                    email: response.data.email,
                })
            );

            onLogin(response.data);

        } catch (err) {

            console.error("LOGIN ERROR:", err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Invalid email or password");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white">
                        Task<span className="text-violet-500">Flow</span>
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Task Management System
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome back
                    </h2>

                    <p className="text-slate-400 mb-6">
                        Login to manage your tasks.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-slate-300 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-violet-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-violet-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    <p className="text-center text-slate-400 mt-6">

                        Don't have an account?{" "}

                        <button
                            onClick={onRegister}
                            className="text-violet-400 hover:text-violet-300 font-semibold"
                        >
                            Register
                        </button>

                    </p>

                </div>
            </div>
        </div>
    );
}

export default Login;