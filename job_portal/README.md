# 🚀 Online Job Portal API (Spring Boot 4 / Java 17)

Nền tảng kết nối ứng viên (Job Seekers) và nhà tuyển dụng (Recruiters).

---

## 📋 Yêu cầu môi trường (Prerequisites)
- **Java:** JDK 17 LTS trở lên
- **Database:** MySQL 8.0 (Cổng mặc định: `3306`)
- **Git**

---

## ⚙️ Cài đặt & Khởi chạy dự án

### 1. Chuẩn bị Cơ sở dữ liệu (MySQL)
- Đảm bảo dịch vụ MySQL đang chạy trên máy (mặc định cổng `3306`, user: `root`).
- Dự án đã cấu hình tự động tạo database `jobPortal_db` khi khởi động lần đầu.

### 2. Cấu hình Mật khẩu MySQL cá nhân (Nếu khác mặc định)
Nếu mật khẩu MySQL máy bạn khác với `hoang123`, chỉ cần gán biến môi trường trong PowerShell trước khi chạy:
```powershell
$env:DB_PASSWORD="mat_khau_mysql_may_ban"
```

### 3. Khởi chạy ứng dụng (Sử dụng Gradle Wrapper)
Mở Terminal tại thư mục gốc của dự án:
```powershell
# Windows
.\gradlew.bat bootRun

# macOS / Linux
./gradlew bootRun
```

---

## 🩺 Kiểm tra API ban đầu (Health Check & Files)
Sau khi ứng dụng khởi động thành công:
- **Health Check:** `GET http://localhost:8080/api/v1/health`
- **Upload File (CV / Avatar):** `POST http://localhost:8080/api/v1/files/upload` (Form-data: `file` + `subDir`)
- **Xem/Tải File:** `GET http://localhost:8080/api/v1/files/{subDir}/{fileName}`

---

## 👥 Phân chia trách nhiệm & Quy ước Git (Team 2 người)

### Nhánh làm việc:
- `main`: Nhánh chạy ổn định, nộp bài / demo.
- `develop`: Nhánh tích hợp chung của cả 2 thành viên.
- `feature/auth-company-job`: **Thành viên A** (Auth, Company, Job Listings, Reviews).
- `feature/candidate-application-interview`: **Thành viên B** (Candidate Profile, Job Applications, Interview Pipeline, Offers).

### Quy tắc commit:
- Luôn `git pull origin develop` trước khi tạo nhánh mới hoặc merge code.
- Định dạng commit chuẩn Conventional:
  - `feat: ...` (Thêm tính năng mới)
  - `fix: ...` (Sửa lỗi)
  - `chore: ...` (Cấu hình, tài liệu)
