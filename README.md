# 🚀 ONLINE JOB PORTAL (Fullstack Mock Project)

> **Dự án kết nối Nhà tuyển dụng & Ứng viên**
> **Thành viên thực hiện:** **Hoàng** (Lead / Recruiter & Platform) & **Nguyên** (Job Seeker & Hiring Pipeline)

Đáp ứng 3 yêu cầu của đề: **CRUD trên 15 bảng**, **Upload file** (CV, ảnh đại diện, logo), **Authentication / Authorization** (JWT + Spring Security, phân quyền 3 vai trò).

---

## 🏛️ Cấu trúc

```text
mockProjectJs/
├── job_portal/          # BACKEND: Spring Boot 4.1.1, Java 17, Spring Security + JWT, MySQL (port 8080)
│   └── src/main/java/com/mockproject/job_portal/
│       ├── config/      # SecurityConfig (luật phân quyền), CorsConfig, DataInitializer (dữ liệu mẫu)
│       ├── security/    # JwtUtil (tạo/kiểm tra token), JwtAuthFilter (đọc token mỗi request)
│       ├── controller/  # REST API
│       ├── service/     # Nghiệp vụ + kiểm tra quyền sở hữu
│       ├── repository/  # Spring Data JPA
│       ├── entity/      # 15 entity
│       └── dto/         # Request / Response
└── job_portal_client/   # FRONTEND: React 19 + Vite + Axios (port 5173)
    └── src/
        ├── components/
        │   ├── common/  # Thành phần dùng chung: Alert, Modal, Loading, EmptyState, StatusBadge, CompanyLogo, Avatar, StarRating, JobListItem, Icon
        │   ├── layout/  # Navbar, Footer, UserMenu, NotificationBell, DashboardLayout (menu trái cho trang quản lý)
        │   └── ProtectedRoute.jsx
        ├── pages/       # Mỗi trang 1 file; trang Nhà tuyển dụng tách trong pages/recruiter/ (Section = phần hiển thị, Modal = form)
        ├── context/     # AuthContext (người dùng đăng nhập + token)
        ├── hooks/       # useClickOutside (đóng menu khi bấm ra ngoài)
        ├── services/    # api.js (axios + token), jobPortalService.js (toàn bộ API)
        ├── utils/       # format.js (nhãn trạng thái, định dạng ngày / lương)
        └── styles/      # variables (màu, font) → base → components → layout → pages
```

**Quy ước giao diện:** không dùng inline style; mọi màu, bo góc, font khai báo một lần trong `styles/variables.css`. Đổi màu thương hiệu chỉ cần sửa `--color-brand`.

---

## ⚡ Chạy dự án

1. **MySQL** đang chạy ở cổng 3306. Tạo file `job_portal/src/main/resources/application-local.properties` (đã bị .gitignore):
   ```properties
   spring.datasource.password=mat_khau_mysql_cua_ban
   ```
2. **Backend**
   ```powershell
   cd job_portal
   .\gradlew.bat bootRun
   ```
   Database `jobPortal_db` được tạo tự động. Lần chạy đầu `DataInitializer` tạo sẵn ngành nghề, hình thức làm việc, tài khoản và dữ liệu demo.
3. **Frontend**
   ```powershell
   cd job_portal_client
   npm install
   npm run dev
   ```
   Mở `http://localhost:5173`.

### 👤 Tài khoản demo

Dữ liệu demo do `config/DemoDataSeeder.java` tạo **1 lần** khi khởi động: 8 công ty, 28 tin tuyển dụng (8 ngành, 5 thành phố), 11 ứng viên có hồ sơ + CV, 27 đơn ứng tuyển ở đủ mọi trạng thái, lịch phỏng vấn, kết quả, Offer, 85 thông báo và 18 đánh giá. Mọi tài khoản demo dùng mật khẩu `123456` (trừ admin).

| Vai trò | Email | Ghi chú để demo |
|---|---|---|
| Quản trị viên | `admin@jobportal.com` / `admin123` | Có 1 tài khoản bị khóa (`quang.ngo@demo.com`) để demo Mở khóa |
| Nhà tuyển dụng | `recruiter@demo.com` | FPT Software + Biển Xanh Software; 9 hồ sơ ở đủ trạng thái: có hồ sơ **đã tới giờ phỏng vấn** (bấm Chấm PV ngay), hồ sơ **đạt phỏng vấn** (Gửi Offer ngay) |
| Ứng viên | `candidate@demo.com` | 4 đơn: chờ duyệt (rút được), đã hẹn phỏng vấn, bị từ chối (có lý do), **đang có Offer** (Chấp nhận / Từ chối ngay) |
| Nhà tuyển dụng khác | `hr.paynest@demo.com`, `hr.tvbdigital@demo.com`, `hr.choxanh@demo.com`, `hr.haidang@demo.com`, `hr.bloom@demo.com`, `hr.lotrinh@demo.com` | Mỗi người 1 công ty |
| Ứng viên khác | `lan.nguyen@`, `minh.tran@`, `huong.le@`, `khoa.pham@`, `thao.vo@`, `duc.hoang@`, `ngoc.bui@`, `tuan.dang@`, `mai.do@` (đuôi `demo.com`) | Có hồ sơ, đơn ứng tuyển, đánh giá |

> Tài khoản ADMIN không thể tự đăng ký, chỉ được tạo bởi hệ thống.
> Muốn tạo lại dữ liệu từ đầu: xóa database `jobPortal_db` rồi chạy lại backend.

---

## 🔐 Xác thực & Phân quyền

**Luồng đăng nhập:**
1. `POST /api/v1/auth/login` → `AuthService` so mật khẩu với bản mã hóa **BCrypt** trong DB → `JwtUtil.generateToken()` tạo JWT (subject = id người dùng, hết hạn sau 24 giờ).
2. FE lưu token vào `localStorage`; `services/api.js` tự gắn header `Authorization: Bearer <token>` vào mọi request.
3. Mỗi request, `JwtAuthFilter` kiểm tra chữ ký + hạn của token, tải `User` từ DB (tài khoản bị khóa sẽ bị từ chối ngay) và đặt vào `SecurityContext` với quyền `ROLE_<vai trò>`.
4. Controller lấy người dùng hiện tại bằng `@AuthenticationPrincipal User currentUser` → **không bao giờ tin `userId` do client gửi**.

**Hai lớp phân quyền:**
- **Theo vai trò**: khai báo tập trung trong `config/SecurityConfig.java` (sai vai trò → 403, chưa đăng nhập → 401).
- **Theo quyền sở hữu**: trong service, ví dụ nhà tuyển dụng chỉ sửa/xử lý tin và hồ sơ thuộc công ty của mình, ứng viên chỉ rút đơn / trả lời Offer của chính mình.

| Chức năng | Khách | Ứng viên | Nhà tuyển dụng | Admin |
|---|:-:|:-:|:-:|:-:|
| Xem việc làm, công ty, đánh giá | ✅ | ✅ | ✅ | ✅ |
| Hồ sơ ứng viên, upload CV, nộp / rút đơn, trả lời Offer | | ✅ | | |
| Viết / sửa / xóa đánh giá của mình | | ✅ | | xóa |
| Quản lý công ty, tin tuyển dụng của mình | | | ✅ | |
| Shortlist, hẹn & chấm phỏng vấn, gửi Offer, từ chối | | | ✅ | |
| Khóa tài khoản, quản lý ngành nghề / hình thức làm việc | | | | ✅ |
| Thông báo, sửa tài khoản, đổi mật khẩu | | ✅ | ✅ | ✅ |

---

## 🔄 Luồng tuyển dụng

```text
APPLIED ──Shortlist──▶ SHORTLISTED ──Hẹn PV──▶ INTERVIEW_SCHEDULED ──Chấm PASS──▶ INTERVIEW_PASSED ──Gửi Offer──▶ OFFERED
   │                       │                          │ Chấm FAIL                       │                    ├─ Chấp nhận ─▶ HIRED
   │                       │                          ▼                                 │                    └─ Từ chối  ─▶ OFFER_DECLINED
   └──────── Nhà tuyển dụng có thể "Từ chối" ở mọi bước trước Offer ──────▶ REJECTED ◀──┘
```

Quy tắc chính (kiểm tra ở backend):
- Chỉ nộp đơn vào tin **đang mở**, mỗi ứng viên 1 đơn / tin; ứng viên chỉ **rút đơn** khi còn ở trạng thái chờ duyệt.
- Lịch phỏng vấn phải ở **tương lai**, giờ kết thúc sau giờ bắt đầu, có link online hoặc địa điểm.
- Chỉ **chấm điểm sau khi buổi phỏng vấn đã bắt đầu**; FAIL → hồ sơ tự chuyển REJECTED.
- Offer chỉ gửi cho ứng viên đã đạt phỏng vấn; lương > 0; ngày bắt đầu không ở quá khứ.
- Mỗi bước đều gửi **thông báo** cho bên còn lại (ứng viên nộp đơn → báo nhà tuyển dụng, v.v.).

---

## 🗂️ 15 Entity & CRUD

| # | Entity (bảng) | Create | Read | Update | Delete |
|---|---|---|---|---|---|
| 1 | User (`users`) | Đăng ký | `/auth/me`, admin xem danh sách | Sửa tài khoản, đổi mật khẩu, admin khóa/mở | Khóa tài khoản (soft delete) |
| 2 | Company (`companies`) | Tạo công ty | Danh sách, chi tiết | Sửa | Xóa (khi chưa có tin) |
| 3 | CompanyLocation (`company_locations`) | Thêm chi nhánh khi tạo/sửa công ty | Hiển thị cùng công ty | Sửa trong form công ty | Bỏ chi nhánh khi sửa |
| 4 | Industry (`industries`) | Admin | Bộ lọc, form đăng tin | Admin | Admin (khi chưa dùng) |
| 5 | JobType (`job_types`) | Admin | Bộ lọc, form đăng tin | Admin | Admin (khi chưa dùng) |
| 6 | JobListing (`job_listings`) | Đăng tin | Tìm kiếm, chi tiết | Sửa, mở lại | Đóng tin |
| 7 | JobDescription (`job_descriptions`) | Cùng tin | Cùng tin | Cùng tin | Cùng tin |
| 8 | Review (`reviews`) | Viết đánh giá | Trang công ty | Sửa của mình | Xóa của mình / admin |
| 9 | CandidateProfile (`candidate_profiles`) | Lưu hồ sơ lần đầu | Ứng viên, nhà tuyển dụng đã nhận đơn | Lưu hồ sơ, upload CV | — |
| 10 | JobApplication (`job_applications`) | Nộp đơn | Đơn của tôi / hồ sơ ứng tuyển | Đổi trạng thái, từ chối | Rút đơn |
| 11 | Shortlist (`shortlists`) | Shortlist | — | — | — |
| 12 | InterviewSlot (`interview_slots`) | Hẹn phỏng vấn | Lịch phỏng vấn | Hoàn thành / hủy | — |
| 13 | InterviewFeedback (`interview_feedback`) | Chấm điểm | — | — | — |
| 14 | Offer (`offers`) | Gửi Offer | Ứng viên xem | Chấp nhận / từ chối | — |
| 15 | Notification (`notifications`) | Tự tạo ở mỗi bước | Chuông thông báo | Đánh dấu đã đọc | — |

## 📎 Upload file

`POST /api/v1/files/upload` (cần đăng nhập, `multipart/form-data`: `file`, `subDir`)

| subDir | Dùng cho | Định dạng |
|---|---|---|
| `resumes` | CV ứng tuyển / CV mặc định | pdf, doc, docx |
| `avatars` | Ảnh đại diện | jpg, jpeg, png, webp |
| `logos` | Logo công ty | jpg, jpeg, png, webp |

File được lưu vào `job_portal/uploads/<subDir>/` với tên ngẫu nhiên (UUID), xem qua `GET /api/v1/files/{subDir}/{fileName}`. Dung lượng tối đa 10MB.

---

## 👥 Phân chia nhiệm vụ

| Tiêu chí | 🏢 HOÀNG (Recruiter & Platform) | 👤 NGUYÊN (Job Seeker & Hiring Pipeline) |
| :--- | :--- | :--- |
| **Vai trò chính** | Tài khoản & phân quyền, Công ty, Tin tuyển dụng, Đánh giá, Quản trị | Hồ sơ ứng viên, Nộp hồ sơ (upload CV), Phỏng vấn, Offer, Thông báo |
| **Entities** | `Users`, `Companies`, `CompanyLocations`, `Industries`, `JobTypes`, `JobListings`, `JobDescriptions`, `Reviews` | `CandidateProfiles`, `JobApplications`, `Shortlists`, `InterviewSlots`, `InterviewFeedback`, `Offers`, `Notifications` |
| **Frontend Pages** | `Home`, `Login`, `Register`, `Companies`, `CompanyDetail`, `RecruiterDashboard`, `AdminDashboard`, `Account` | `JobDetail`, `CandidateProfile` |
