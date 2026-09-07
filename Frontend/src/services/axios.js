import axios from "axios";
import { getItem } from "../utils/storageUtils";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_DOMAIN,
  withCredentials: false,
});

// Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
