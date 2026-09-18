import api from './api';
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1';

/* =========================================================================
 * 0. HEALTH CHECK (Kiểm tra kết nối)
 * ========================================================================= */
export const checkHealth = () => api.get('/health');

/* =========================================================================
 * 1. MODULE AUTHENTICATION (Dành cho Hoàng - Đăng ký, Đăng nhập, Thông tin)
 * ========================================================================= */
export const authService = {
  /**
   * Đăng ký tài khoản mới (Recruiter hoặc Job Seeker)
   * @param {Object} data - { email, password, fullName, phone, role: 'RECRUITER' | 'JOB_SEEKER' }
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Đăng nhập hệ thống
   * @param {Object} credentials - { email, password }
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * Lấy thông tin tài khoản hiện tại
   * @param {number} userId
   */
  getMe: (userId) => api.get('/auth/me', { params: { userId } }),
};

/* =========================================================================
 * 2. MODULE FILE STORAGE (Dùng chung cho cả Hoàng và Nguyên)
 * ========================================================================= */
export const fileService = {
  /**
   * Tải file lên Spring Boot (lưu vào uploads/resumes hoặc uploads/avatars)
   * @param {File} file - Đối tượng file được chọn từ input
   * @param {string} subDir - Thư mục lưu ('resumes' hoặc 'avatars')
   */
  uploadFile: async (file, subDir = 'resumes') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subDir', subDir);

    const res = await axios.post(`${BASE_URL}/files/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },

  /**
   * Lấy đường dẫn trực tiếp để tải hoặc xem file
   */
  getFileUrl: (subDir, fileName) => `${BASE_URL}/files/${subDir}/${fileName}`,
};

/* =========================================================================
 * 3. MODULE COMPANY & METADATA (Dành cho Hoàng)
 * ========================================================================= */
export const companyService = {
  /**
   * Tạo công ty mới kèm danh sách chi nhánh
   * @param {Object} data - { recruiterId, name, website, logoUrl, description, locations: [{ address, city, country }] }
   */
  createCompany: (data) => api.post('/companies', data),

  /**
   * Lấy danh sách công ty (kèm tìm kiếm từ khóa, thành phố)
   * @param {string} keyword - Tên công ty
   * @param {string} city - Thành phố (Hà Nội, HCM...)
   */
  getAllCompanies: (keyword, city) =>
    api.get('/companies', { params: { keyword, city: city === 'All' ? undefined : city } }),

  /**
   * Lấy chi tiết công ty theo ID
   */
  getCompanyById: (id) => api.get(`/companies/${id}`),

  /**
   * Lấy danh sách công ty do Recruiter sở hữu
   */
  getCompaniesByRecruiter: (recruiterId) => api.get(`/companies/recruiter/${recruiterId}`),

  /**
   * Lấy danh mục ngành nghề (CNTT, Tài chính, Marketing...)
   */
  getIndustries: () => api.get('/industries'),

  /**
   * Lấy danh mục hình thức làm việc (Full-time, Remote, Hybrid...)
   */
  getJobTypes: () => api.get('/job-types'),
};

/* =========================================================================
 * 4. MODULE JOB LISTINGS (Dành cho Hoàng - Đăng tin, tìm kiếm việc làm)
 * ========================================================================= */
export const jobService = {
  /**
   * Tìm kiếm và lọc việc làm đa tiêu chí
   * @param {Object} params - { keyword, industryId, jobTypeId, city }
   */
  getAllJobs: (params = {}) => {
    const query = {
      keyword: params.keyword || undefined,
      industryId: params.industryId || undefined,
      jobTypeId: params.jobTypeId || undefined,
      city: params.city === 'All' ? undefined : params.city || undefined,
    };
    return api.get('/jobs', { params: query });
  },

  /**
   * Lấy chi tiết việc làm kèm mô tả đầy đủ
   */
  getJobById: (id) => api.get(`/jobs/${id}`),

  /**
   * Recruiter đăng bài tuyển dụng mới (tự động tạo JobListing + JobDescription)
   * @param {Object} data - { recruiterId, companyId, industryId, jobTypeId, title, salaryRange, responsibilities, requirements, benefits }
   */
  createJob: (data) => api.post('/jobs', data),

  /**
   * Cập nhật tin tuyển dụng
   */
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),

  /**
   * Đóng tin tuyển dụng (chuyển trạng thái CLOSED)
   */
  closeJob: (id) => api.delete(`/jobs/${id}`),

  /**
   * Lấy danh sách các tin do Recruiter này đăng
   */
  getJobsByRecruiter: (recruiterId) => api.get(`/jobs/recruiter/${recruiterId}`),
};

/* =========================================================================
 * 5. MODULE REVIEWS (Dành cho Hoàng - Đánh giá công ty)
 * ========================================================================= */
export const reviewService = {
  /**
   * Ứng viên gửi đánh giá cho công ty
   * @param {number} companyId
   * @param {Object} data - { userId, rating: 1-5, comment }
   */
  createReview: (companyId, data) => api.post(`/companies/${companyId}/reviews`, data),

  /**
   * Lấy danh sách đánh giá của công ty
   */
  getCompanyReviews: (companyId) => api.get(`/companies/${companyId}/reviews`),
};

/* =========================================================================
 * 6. MODULE CANDIDATE PROFILE (Dành cho Nguyên - Hồ sơ ứng viên)
 * ========================================================================= */
export const candidateService = {
  /**
   * Tạo hoặc cập nhật hồ sơ ứng viên
   * @param {Object} data - { userId, bio, skills, education, experience, avatarUrl }
   */
  saveProfile: (data) => api.post('/candidates/profile', data),

  /**
   * Lấy hồ sơ ứng viên theo User ID
   */
  getProfile: (userId) => api.get(`/candidates/profile/${userId}`),

  /**
   * Upload CV mặc định cho ứng viên
   * @param {number} userId
   * @param {File} file
   */
  uploadCv: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/candidates/upload-cv?userId=${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/* =========================================================================
 * 7. MODULE JOB APPLICATIONS (Dành cho Nguyên - Nộp đơn ứng tuyển)
 * ========================================================================= */
export const applicationService = {
  /**
   * Ứng viên nộp đơn vào một công việc
   * @param {number} jobId
   * @param {Object} data - { candidateId, resumeUrl, coverLetter }
   */
  applyJob: (jobId, data) => api.post(`/applications/jobs/${jobId}/apply`, data),

  /**
   * Ứng viên xem danh sách các đơn mình đã nộp
   * @param {number} candidateId
   */
  getMyApplications: (candidateId) =>
    api.get('/applications/my-applications', { params: { candidateId } }),

  /**
   * Recruiter xem danh sách ứng viên nộp vào tin tuyển dụng của mình
   * @param {number} jobId
   * @param {number} recruiterId
   */
  getJobApplications: (jobId, recruiterId) =>
    api.get(`/applications/jobs/${jobId}/applications`, { params: { recruiterId } }),
};

/* =========================================================================
 * 8. MODULE HIRING PIPELINE (Dành cho Nguyên - Shortlist, Phỏng vấn, Offer)
 * ========================================================================= */
export const hiringService = {
  /**
   * Recruiter duyệt hồ sơ vào Shortlist
   * @param {number} appId
   * @param {Object} data - { recruiterId, note }
   */
  shortlist: (appId, data) => api.post(`/hiring/applications/${appId}/shortlist`, data),

  /**
   * Recruiter xếp lịch phỏng vấn cho ứng viên
   * @param {Object} data - { applicationId, recruiterId, startTime, endTime, meetingLink, location }
   */
  scheduleInterview: (data) => api.post('/hiring/interviews/schedule', data),

  /**
   * Recruiter chấm điểm và nhận xét sau phỏng vấn
   * @param {number} slotId
   * @param {Object} data - { interviewerId, score: 1-100, comments, result: 'PASS' | 'FAIL' }
   */
  submitFeedback: (slotId, data) => api.post(`/hiring/interviews/${slotId}/feedback`, data),

  /**
   * Recruiter gửi Offer cho ứng viên (Yêu cầu phỏng vấn PASS trước)
   * @param {number} appId
   * @param {Object} data - { recruiterId, salary, startDate: 'YYYY-MM-DD', notes }
   */
  createOffer: (appId, data) => api.post(`/hiring/applications/${appId}/offer`, data),

  /**
   * Ứng viên phản hồi Offer (Chấp nhận hoặc Từ chối)
   * @param {number} offerId
   * @param {Object} data - { candidateId, status: 'ACCEPTED' | 'DECLINED' }
   */
  respondOffer: (offerId, data) => api.put(`/hiring/offers/${offerId}/respond`, data),
};

/* =========================================================================
 * 9. MODULE NOTIFICATIONS (Dành cho Nguyên - Thông báo hệ thống)
 * ========================================================================= */
export const notificationService = {
  /**
   * Lấy danh sách thông báo của người dùng
   * @param {number} userId
   */
  getNotifications: (userId) => api.get('/notifications', { params: { userId } }),

  /**
   * Đánh dấu thông báo đã đọc
   * @param {number} id
   * @param {number} userId
   */
  markAsRead: (id, userId) => api.put(`/notifications/${id}/read`, null, { params: { userId } }),
};
