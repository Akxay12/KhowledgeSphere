import axios from 'axios';
import { showToast } from '../lib/toast';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// ================= REQUEST INTERCEPTOR =================
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');

      console.log("TOKEN:", token);
      console.log("REQUEST URL:", config.url);

      const publicApis = ["/users/login", "/users/signup"];

      // 🔥 CLEAN URL FIX
      let cleanUrl = config.url || '';

      if (cleanUrl.startsWith('http')) {
        try {
          cleanUrl = new URL(cleanUrl).pathname;
        } catch (e) { }
      }

      if (!cleanUrl.startsWith('/')) {
        cleanUrl = '/' + cleanUrl;
      }

      // 🔥 FIXED PUBLIC CHECK
      const isPublicAuth = publicApis.some((url) =>
        cleanUrl.includes(url)
      );

      const isPublicGet =
        config.method?.toLowerCase() === 'get' &&
        (
          cleanUrl.startsWith('/publications') ||
          /^\/users\/[^/]+\/picture$/.test(cleanUrl) ||
          /^\/users\/[^/]+$/.test(cleanUrl) ||
          cleanUrl.startsWith('/public')
        );

      const isPublic = isPublicAuth || isPublicGet;

      // 🔥 NEVER BLOCK REQUEST
      if (token && !isPublicAuth) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log("CLEAN URL:", cleanUrl);
      console.log("isPublic:", isPublic);
      console.log("AUTH HEADER:", config.headers.Authorization);

    } catch (err) {
      console.warn('Interceptor error:', err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {

    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    console.error("Full Axios Error:", error);

    const reqUrl = error.config?.url || '';
    const isPublicProfileUrl = reqUrl.includes('/public/users/') || reqUrl.includes('/public/');

    // 🔥 ONLY 401 = SESSION EXPIRED
    if (error.response?.status === 401 && !isPublicProfileUrl) {
      if (localStorage.getItem("token")) {
        localStorage.clear();
        showToast('Your session has expired. Please log in again.');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
      return Promise.reject(error);
    }

    // 🔥 403 DEBUG ONLY (NO LOGOUT)
    if (error.response?.status === 403) {
      console.warn("403 Forbidden:", error.response);
    }

    // 🔥 500 ERROR
    if (error.response?.status === 500) {
      showToast('Something went wrong. Please try again.');
    }

    // 🔥 NETWORK ERROR
    if (!error.response) {
      showToast('Backend server unavailable. Please try again later.');
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Request failed';

    return Promise.reject({
      status: error.response?.status || 500,
      message,
      data: error.response?.data || null,
      isNetworkError: !error.response,
    });
  }
);

export default apiClient;