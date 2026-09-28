import { useState } from "react";
import api from "./api/axios";

function Register({ onRegister, onLogin }) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            await api.post("/api/auth/register", {
                name,
                email,
                password,
            });

            setSuccess("Registration successful! Please login.");

            setName("");
            setEmail("");
            setPassword("");

            setTimeout(() => {
                onRegister();
            }, 1000);

        } catch (err) {

            console.error("REGISTER ERROR:", err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Registration failed");
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
                        Create your account
                    </p>

                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Create Account
                    </h2>

                    <p className="text-slate-400 mb-6">
                        Start managing your tasks.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 mb-5">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-slate-300 mb-2">
                                Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                required
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-violet-500"
                            />
                        </div>

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
                            {loading ? "Creating account..." : "Create Account"}
                        </button>

                    </form>

                    <p className="text-center text-slate-400 mt-6">

                        Already have an account?{" "}

                        <button
                            onClick={onLogin}
                            className="text-violet-400 hover:text-violet-300 font-semibold"
                        >
                            Login
                        </button>

                    </p>

                </div>
            </div>
        </div>
    );
}

export default Register;