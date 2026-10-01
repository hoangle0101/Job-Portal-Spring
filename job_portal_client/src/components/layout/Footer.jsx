import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo">job<span>portal</span></Link>
            <p className="footer-about">
              Nền tảng kết nối ứng viên và nhà tuyển dụng: đăng tin, nộp hồ sơ, hẹn phỏng vấn và gửi Offer trên cùng một hệ thống.
            </p>
          </div>

          <div>
            <h3 className="footer-heading">Dành cho ứng viên</h3>
            <ul className="footer-links">
              <li><Link to="/">Tìm việc làm</Link></li>
              <li><Link to="/companies">Danh sách công ty</Link></li>
              <li><Link to="/my-applications">Hồ sơ & ứng tuyển</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Dành cho nhà tuyển dụng</h3>
            <ul className="footer-links">
              <li><Link to="/register">Tạo tài khoản tuyển dụng</Link></li>
              <li><Link to="/recruiter/dashboard">Đăng tin tuyển dụng</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">© 2026 JobPortal · Mock Project FPT · Hoàng & Nguyên</div>
      </div>
    </footer>
  );
}
