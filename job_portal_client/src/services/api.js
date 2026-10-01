import axios from 'axios';

export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';
export const STORAGE_KEY = 'job_portal_user';

const api = axios.create({
  baseURL: `${SERVER_URL}/api/v1`,
  timeout: 15000,
});

// Request Interceptor: gắn JWT token (lưu khi đăng nhập) vào header Authorization
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Response Interceptor: Spring Boot trả về { success, message, data } -> chỉ lấy phần data
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      return body.data;
    }
    return body;
  },
  (error) => {
    const status = error.response?.status;
    const hadToken = !!JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')?.token;

    // Token hết hạn / không hợp lệ / tài khoản bị khóa -> xóa phiên và chuyển về trang đăng nhập
    if (status === 401 && hadToken) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = '/login';
    }

    const message = error.response
      ? error.response.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại'
      : 'Không thể kết nối đến máy chủ Backend (Port 8080)';
    return Promise.reject(new Error(message));
  }
);

export default api;
