import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

// NavLink tự thêm class "active" khi đang ở đúng trang
const navClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

export default function Navbar() {
  const { user, isRecruiter, isSeeker, isAdmin } = useAuth();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">job<span>portal</span></Link>

        {/* Menu chính, hiển thị thêm mục theo vai trò */}
        <nav className="nav">
          <NavLink to="/" end className={navClass}>Việc làm</NavLink>
          <NavLink to="/companies" className={navClass}>Công ty</NavLink>
          {isSeeker && <NavLink to="/my-applications" className={navClass}>Hồ sơ & ứng tuyển</NavLink>}
          {isRecruiter && <NavLink to="/recruiter/dashboard" className={navClass}>Quản lý tuyển dụng</NavLink>}
          {isAdmin && <NavLink to="/admin" className={navClass}>Quản trị</NavLink>}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
