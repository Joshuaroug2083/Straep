import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add access token
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle transparent 401 refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    // Check if unauthorized and not already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Call token refresh endpoint
        // simplejwt default is /token/refresh/ or /auth/login/refresh/?
        // Wait, let's verify what url is set up for refresh in backend config/urls.py or users/urls.py.
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/login/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;
        const newRefreshToken = refreshResponse.data.refresh;

        useAuthStore.getState().setAuth(newAccessToken, newRefreshToken || refreshToken, useAuthStore.getState().user);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
