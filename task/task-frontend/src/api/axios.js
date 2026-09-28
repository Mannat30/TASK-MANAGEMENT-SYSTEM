import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081",
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle expired/invalid JWT
api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const url = error.config?.url || "";

            // Don't immediately clear token for login/register requests
            if (!url.includes("/api/auth/login") &&
                !url.includes("/api/auth/register")) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }

        return Promise.reject(error);
    }
);

export default api;