import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/jobPortalService';
import Alert from '../components/common/Alert';

// Trang mặc định sau khi đăng nhập, theo vai trò
const HOME_BY_ROLE = {
  RECRUITER: '/recruiter/dashboard',
  ADMIN: '/admin',
  JOB_SEEKER: '/',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      // Vai trò do backend trả về theo tài khoản, không do người dùng chọn
      const user = await authService.login({ email, password });
      login(user);
      navigate(HOME_BY_ROLE[user.role] || '/');
    } catch (err) {
      setErrorMsg(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Đăng nhập</h1>
        <p className="auth-subtitle">Chào mừng bạn quay trở lại JobPortal.</p>

        <Alert message={errorMsg ? { type: 'error', text: errorMsg } : null} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input" required placeholder="ten@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" className="form-input" required placeholder="Nhập mật khẩu"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register" className="text-link">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
