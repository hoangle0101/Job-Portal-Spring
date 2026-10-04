import api from './api';

/*
 * Mọi API cần đăng nhập đều tự gắn token (xem api.js).
 * Backend lấy người dùng hiện tại từ token, nên FE KHÔNG gửi userId / recruiterId / candidateId.
 */

/* ======================= 1. XÁC THỰC & TÀI KHOẢN ======================= */
export const authService = {
  // data: { email, password, fullName, phone, role: 'RECRUITER' | 'JOB_SEEKER' }
  register: (data) => api.post('/auth/register', data),
  // credentials: { email, password } -> trả về thông tin user + token
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  // data: { fullName, phone, avatarUrl }
  updateMe: (data) => api.put('/auth/me', data),
  // data: { currentPassword, newPassword }
  changePassword: (data) => api.put('/auth/me/password', data),
};

/* ======================= 2. UPLOAD FILE ======================= */
export const fileService = {
  // subDir: 'resumes' (pdf, doc, docx) | 'avatars' | 'logos' (jpg, png, webp) -> { fileName, fileUrl }
  uploadFile: (file, subDir) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subDir', subDir);
    return api.post('/files/upload', formData);
  },
};

/* ======================= 3. CÔNG TY & DANH MỤC ======================= */
export const companyService = {
  // data: { name, website, logoUrl, description, locations: [{ address, city }] }
  createCompany: (data) => api.post('/companies', data),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/companies/${id}`),
  getAllCompanies: (keyword, city) =>
    api.get('/companies', { params: { keyword: keyword || undefined, city: city || undefined } }),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  getCompanyJobs: (id) => api.get(`/companies/${id}/jobs`),
  getMyCompanies: () => api.get('/companies/mine'),
  getIndustries: () => api.get('/industries'),
  getJobTypes: () => api.get('/job-types'),
};

/* ======================= 4. TIN TUYỂN DỤNG ======================= */
export const jobService = {
  // params: { keyword, industryId, jobTypeId, city }
  getAllJobs: (params = {}) =>
    api.get('/jobs', {
      params: {
        keyword: params.keyword || undefined,
        industryId: params.industryId || undefined,
        jobTypeId: params.jobTypeId || undefined,
        city: params.city || undefined,
      },
    }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/mine'),
  // data: { companyId, industryId, jobTypeId, title, salaryRange, responsibilities, requirements, benefits }
  createJob: (data) => api.post('/jobs', data),
  // data: { industryId, jobTypeId, title, salaryRange, status, responsibilities, requirements, benefits }
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  closeJob: (id) => api.delete(`/jobs/${id}`),
};

/* ======================= 5. ĐÁNH GIÁ CÔNG TY ======================= */
export const reviewService = {
  getCompanyReviews: (companyId) => api.get(`/companies/${companyId}/reviews`),
  // data: { rating: 1-5, comment }
  createReview: (companyId, data) => api.post(`/companies/${companyId}/reviews`, data),
  updateReview: (companyId, reviewId, data) => api.put(`/companies/${companyId}/reviews/${reviewId}`, data),
  deleteReview: (companyId, reviewId) => api.delete(`/companies/${companyId}/reviews/${reviewId}`),
};

/* ======================= 6. HỒ SƠ ỨNG VIÊN ======================= */
export const candidateService = {
  getMyProfile: () => api.get('/candidates/me/profile'),
  // data: { bio, skills, education, experience }
  saveMyProfile: (data) => api.post('/candidates/me/profile', data),
  uploadCv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/candidates/me/upload-cv', formData);
  },
  // Recruiter xem hồ sơ của ứng viên đã nộp đơn vào tin của mình
  getCandidateProfile: (candidateId) => api.get(`/candidates/${candidateId}/profile`),
};

/* ======================= 7. ĐƠN ỨNG TUYỂN ======================= */
export const applicationService = {
  // data: { resumeUrl (để trống = dùng CV mặc định), coverLetter }
  applyJob: (jobId, data) => api.post(`/applications/jobs/${jobId}`, data),
  getMyApplications: () => api.get('/applications/mine'),
  withdraw: (applicationId) => api.delete(`/applications/${applicationId}`),
  // Recruiter: tất cả đơn vào các tin của mình (hoặc 1 tin nếu có jobId)
  getRecruiterApplications: (jobId) => api.get('/applications/recruiter', { params: { jobId: jobId || undefined } }),
  reject: (applicationId, reason) => api.put(`/applications/${applicationId}/reject`, { reason }),
};

/* ======================= 8. QUY TRÌNH TUYỂN DỤNG ======================= */
export const hiringService = {
  shortlist: (appId, note) => api.post(`/hiring/applications/${appId}/shortlist`, { note }),
  // data: { applicationId, startTime, endTime, meetingLink, location }
  scheduleInterview: (data) => api.post('/hiring/interviews/schedule', data),
  // data: { score: 0-100, comments, result: 'PASS' | 'FAIL' }
  submitFeedback: (slotId, data) => api.post(`/hiring/interviews/${slotId}/feedback`, data),
  // data: { salary, startDate: 'YYYY-MM-DD', notes }
  createOffer: (appId, data) => api.post(`/hiring/applications/${appId}/offer`, data),
  // status: 'ACCEPTED' | 'DECLINED'
  respondOffer: (offerId, status) => api.put(`/hiring/offers/${offerId}/respond`, { status }),
};

/* ======================= 9. THÔNG BÁO ======================= */
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

/* ======================= 10. QUẢN TRỊ (ADMIN) ======================= */
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  setUserActive: (userId, active) => api.put(`/admin/users/${userId}/active`, null, { params: { active } }),
  // data: { name, description }
  createIndustry: (data) => api.post('/admin/industries', data),
  updateIndustry: (id, data) => api.put(`/admin/industries/${id}`, data),
  deleteIndustry: (id) => api.delete(`/admin/industries/${id}`),
  createJobType: (data) => api.post('/admin/job-types', data),
  updateJobType: (id, data) => api.put(`/admin/job-types/${id}`, data),
  deleteJobType: (id) => api.delete(`/admin/job-types/${id}`),
};
