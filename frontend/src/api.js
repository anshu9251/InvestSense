import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Automatically attach the auth token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If a request comes back unauthorized, clear stale auth and send user to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const getPortfolio = () => api.get("/api/portfolio");
export const addHolding = (holdingData) => api.post("/api/portfolio/add", holdingData);
export const deleteHolding = (holdingId) => api.delete(`/api/portfolio/${holdingId}`);
export const getRiskAnalysis = () => api.get("/api/portfolio/risk-analysis");
export const getStockResearch = (symbol) => api.get(`/api/stock/${symbol}/research`);

export const registerUser = (data) => api.post("/api/auth/register", data);
export const loginUser = (data) => api.post("/api/auth/login", data);

export const getQuote = (symbol) => api.get(`/api/stock/${symbol}/quote`);
export const getWatchlist = () => api.get("/api/watchlist");
export const addToWatchlist = (symbol) => api.post("/api/watchlist/add", { symbol });
export const removeFromWatchlist = (symbol) => api.delete(`/api/watchlist/${symbol}`);

export const getNotifications = () => api.get("/api/notifications");
export const sendAgentCommand = (message, currentPage = "/") =>
    api.post("/api/agent/command", { message, current_page: currentPage });

export default api;