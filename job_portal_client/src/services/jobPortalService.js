import api from './api';
import axios from 'axios';

// 1. Health Check
export const checkHealth = () => api.get('/health');

// 2. Auth Service
export const authService = {
  login: async (credentials) => {
    // Có thể kết nối API hoặc fallback giả lập nếu backend chưa xong
    try {
      return await api.post('/auth/login', credentials);
    } catch {
      // Mock login tiện cho việc demo nếu chưa nối DB
      return {
        id: 1,
        email: credentials.email,
        fullName: credentials.email.split('@')[0],
        role: credentials.role || 'JOB_SEEKER',
        token: 'mock-jwt-token-123456'
      };
    }
  },
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// 3. File Upload Service
export const fileService = {
  uploadFile: async (file, subDir = 'resumes') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subDir', subDir);
    
    // Gọi thẳng endpoint FileController của Spring Boot
    const res = await axios.post('http://localhost:8080/api/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data || res.data;
  },
  getFileUrl: (subDir, fileName) => `http://localhost:8080/api/v1/files/${subDir}/${fileName}`
};

// 4. Job Service (Hoàng)
export const jobService = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
};

// 5. Application & Hiring Service (Nguyên)
export const applicationService = {
  applyJob: (jobId, data) => api.post(`/jobs/${jobId}/apply`, data),
  getMyApplications: () => api.get('/applications/my-applications'),
  getJobApplications: (jobId) => api.get(`/jobs/${jobId}/applications`),
  updateStatus: (appId, status) => api.patch(`/applications/${appId}/status`, { status }),
  scheduleInterview: (data) => api.post('/interviews/schedule', data),
  sendOffer: (data) => api.post('/offers/send', data),
};
