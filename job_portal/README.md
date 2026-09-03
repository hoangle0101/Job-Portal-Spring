# 🚀 Dự án Demo Spring Boot API

## 📋 Yêu cầu môi trường (Prerequisites)
- **Java:** JDK 17 LTS trở lên
- **Database:** MySQL 8.0 (cổng mặc định `3306`)
- **Git**

## ⚙️ Cài đặt & Khởi chạy

### 1. Chuẩn bị cơ sở dữ liệu
Đảm bảo dịch vụ MySQL đang chạy trên máy. Ứng dụng sẽ tự động khởi tạo cơ sở dữ liệu `jobPortal_db` nếu chưa có.

### 2. Cấu hình mật khẩu MySQL cá nhân (Tùy chọn)
Nếu mật khẩu MySQL máy bạn khác với mật khẩu mặc định, hãy đặt biến môi trường trong PowerShell trước khi chạy:
```powershell
$env:DB_PASSWORD="mat_khau_cua_ban"
```

### 3. Chạy ứng dụng
Mở Terminal tại thư mục dự án và gõ:
```powershell
# Windows
.\mvnw.cmd spring-boot:run
```

Sau khi khởi động thành công, kiểm tra API tại:
👉 `http://localhost:8080/api/v1/health`
