import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token if available
apiClient.interceptors.request.use(
  (config) => {
    try {
      const authSessionRaw = localStorage.getItem('knowledgesphere_auth_session');
      if (authSessionRaw) {
        const session = JSON.parse(authSessionRaw);
        const token = session.token || session.accessToken || session.idToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.warn('Error reading auth token for request interceptor:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors cleanly
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const formattedError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Network request failed',
      data: error.response?.data || null,
      isNetworkError: !error.response,
    };

    if (error.response?.status === 401) {
      // Token expired or unauthorized
      console.warn('Unauthorized request - session may be expired');
    }

    return Promise.reject(formattedError);
  }
);

export default apiClient;
