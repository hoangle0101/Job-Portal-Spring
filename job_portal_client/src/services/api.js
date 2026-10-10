import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Gắn token nếu có)
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Chuẩn hóa data từ ApiResponse<T> của Spring Boot)
api.interceptors.response.use(
  (response) => {
    // Nếu backend trả về { success: true, data: ... }
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Không thể kết nối đến máy chủ Backend (Port 8080)';
    return Promise.reject(new Error(errorMsg));
  }
);

export default api;
