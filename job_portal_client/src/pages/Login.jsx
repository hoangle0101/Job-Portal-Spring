import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/jobPortalService';
import { Briefcase, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('JOB_SEEKER');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authService.login({ email, password, role });
      login(user);
      navigate(user.role === 'RECRUITER' ? '/recruiter/dashboard' : '/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '12px' }}>
            <Briefcase size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Đăng nhập JobPortal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Chào mừng bạn quay trở lại với hệ thống</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Vai trò của bạn:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-subtle)' }}
            >
              <option value="JOB_SEEKER">Ứng viên tìm việc (Job Seeker)</option>
              <option value="RECRUITER">Nhà tuyển dụng (Recruiter)</option>
              <option value="ADMIN">Quản trị viên (Admin)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Email đăng nhập:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
              <Mail size={18} color="var(--text-muted)" />
              <input
                type="email"
                required
                placeholder="vidu@fpt.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Mật khẩu:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
              <Lock size={18} color="var(--text-muted)" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Đang xác thực...' : <>Đăng nhập <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
