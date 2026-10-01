import { SERVER_URL } from '../services/api';

// Nhãn & màu nhãn (tone) cho trạng thái đơn ứng tuyển, khớp enum ApplicationStatus ở backend.
// step: bước hiện tại trên thanh tiến trình của ứng viên (null = quy trình đã kết thúc không thành công)
export const APPLICATION_STATUS = {
  APPLIED: { label: 'Chờ duyệt', tone: 'gray', step: 1 },
  SHORTLISTED: { label: 'Vào vòng trong', tone: 'blue', step: 2 },
  INTERVIEW_SCHEDULED: { label: 'Đã hẹn phỏng vấn', tone: 'blue', step: 3 },
  INTERVIEW_PASSED: { label: 'Đạt phỏng vấn', tone: 'green', step: 3 },
  OFFERED: { label: 'Đã nhận Offer', tone: 'amber', step: 4 },
  HIRED: { label: 'Đã nhận việc', tone: 'green', step: 5 },
  OFFER_DECLINED: { label: 'Từ chối Offer', tone: 'gray', step: null },
  REJECTED: { label: 'Không phù hợp', tone: 'red', step: null },
};

// Các bước của quy trình tuyển dụng, hiển thị trên thanh tiến trình
export const APPLICATION_STEPS = ['Nộp hồ sơ', 'Vòng hồ sơ', 'Phỏng vấn', 'Offer', 'Nhận việc'];

export const CITY_OPTIONS = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];

export const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  RECRUITER: 'Nhà tuyển dụng',
  JOB_SEEKER: 'Ứng viên',
};

// File được lưu ở backend dạng "/api/v1/files/..." -> ghép thêm địa chỉ server
export const fileUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${SERVER_URL}${url}`;
};

// "FPT Software" -> "FS"; dùng cho logo / ảnh đại diện mặc định
export const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2);
  return letters.toUpperCase();
};

export const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(value));
};

// "Hôm nay", "Hôm qua", "3 ngày trước"; quá 30 ngày thì hiện ngày cụ thể
export const formatRelativeDate = (value) => {
  if (!value) return '';
  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((startOfDay(new Date()) - startOfDay(new Date(value))) / 86400000);
  if (days <= 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days <= 30) return `${days} ngày trước`;
  return formatDate(value);
};

export const formatSalary = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ/tháng`;
};
