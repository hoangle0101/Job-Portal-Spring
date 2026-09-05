# 🚀 ONLINE JOB PORTAL (Enterprise Fullstack Mock Project)

> **Dự án kết nối Nhà tuyển dụng & Ứng viên**  
> **Thành viên thực hiện:** **Hoàng** (Lead / Recruiter & Platform) & **Nguyên** (Job Seeker & Hiring Pipeline)

---

## 🏛️ CẤU TRÚC MONOREPO

```text
mockProjectJs/
├── .gitignore                   # Cấu hình bảo vệ Git Monorepo (chặn node_modules, build artifacts, secrets)
├── job_portal/                  # ☕ BACKEND: Spring Boot 4.1.1, Java 17, Gradle 9.7 (Port 8080)
│   ├── src/main/java/           # Phân lớp Controller, Service, Repository, Entity
│   └── uploads/                 # Thư mục lưu file CV & Avatar tự động
└── job_portal_client/           # ⚛️ FRONTEND: React 19, Vite, Axios, Lucide Icons (Port 5173)
    └── src/                     # Components, Pages, Context, Services
```

---

## ⚡ HƯỚNG DẪN KHỞI CHẠY DỰ ÁN (QUICK START)

### 1. Khởi động Backend (Spring Boot):
Mở Terminal tại thư mục `job_portal`:
```powershell
cd job_portal
.\gradlew.bat bootRun
```
* Backend chạy tại: `http://localhost:8080`
* Tự động kết nối MySQL và tạo database `jobPortal_db` nếu chưa có.
* Mật khẩu MySQL cá nhân: chỉnh trong file `application-local.properties` (không bị đẩy lên Git).

### 2. Khởi động Frontend (React Vite):
Mở một tab Terminal khác tại thư mục `job_portal_client`:
```powershell
cd job_portal_client
npm install      # (Chỉ cần chạy lần đầu)
npm run dev
```
* Frontend chạy tại: `http://localhost:5173`
* Tự động kết nối tới Spring Boot API tại `http://localhost:8080/api/v1`.

---

## 👥 BẢNG PHÂN CHIA NHIỆM VỤ ĐỘC LẬP (0% CONFLICT)

| Tiêu chí | 🏢 HOÀNG (Recruiter & Platform) | 👤 NGUYÊN (Job Seeker & Hiring Pipeline) |
| :--- | :--- | :--- |
| **Vai trò chính** | Quản lý Tài khoản (Auth & Roles), Công ty, Đăng tin tuyển dụng và Đánh giá | Quản lý Hồ sơ ứng viên, Nộp hồ sơ (Upload CV), Lịch phỏng vấn & Gửi Offer |
| **8 Entities phụ trách** | `Users`, `Companies`, `CompanyLocations`, `Industries`, `JobTypes`, `JobListings`, `JobDescriptions`, `Reviews` | `CandidateProfiles`, `JobApplications`, `Shortlists`, `InterviewSlots`, `InterviewFeedback`, `Offers`, `Notifications` |
| **Backend Packages** | `auth`, `company`, `job`, `review` | `candidate`, `application`, `interview`, `offer`, `notification` |
| **Frontend Pages** | `Home.jsx`, `Login.jsx`, `Register.jsx`, `RecruiterDashboard.jsx` | `JobDetail.jsx` (Form nộp CV), `CandidateProfile.jsx` (Theo dõi đơn & Offer) |
| **Nhánh Git làm việc** | `feature/hoang-recruiter-jobs` | `feature/nguyen-candidate-hiring` |

---

## 🛡️ QUY TRÌNH PHỐI HỢP GIT ĐỂ KHÔNG BỊ XUNG ĐỘT

1. **Trước khi bắt đầu code mỗi ngày:**
   ```powershell
   git checkout develop
   git pull origin develop
   ```
2. **Code trên nhánh riêng của mình:**
   * Hoàng: `git checkout -b feature/hoang-recruiter-jobs`
   * Nguyên: `git checkout -b feature/nguyen-candidate-hiring`
3. **Khi hoàn thành tính năng:**
   ```powershell
   git add .
   git commit -m "feat: [Tên tính năng theo chuẩn Conventional]"
   git push -u origin [Tên nhánh của mình]
   ```
4. **Lên GitHub tạo Pull Request (PR) vào nhánh `develop` để người kia review và merge!**

---

## 🩺 CÁC ENDPOINT TEST SẴN CÓ
* **Health Check:** `GET http://localhost:8080/api/v1/health`
* **Upload File:** `POST http://localhost:8080/api/v1/files/upload` (multipart/form-data: `file`, `subDir`)
* **Download File:** `GET http://localhost:8080/api/v1/files/{subDir}/{fileName}`
