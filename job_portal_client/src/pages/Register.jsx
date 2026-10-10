import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/jobPortalService';
import { Briefcase, Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
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
      const user = await authService.login({ fullName, email, password, role });
      login(user);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Tạo tài khoản mới</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Bắt đầu hành trình tìm kiếm việc làm hoặc tuyển dụng</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Tôi muốn đăng ký làm:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('JOB_SEEKER')}
                className={`btn ${role === 'JOB_SEEKER' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '13px', padding: '10px' }}
              >
                Ứng viên tìm việc
              </button>
              <button
                type="button"
                onClick={() => setRole('RECRUITER')}
                className={`btn ${role === 'RECRUITER' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '13px', padding: '10px' }}
              >
                Nhà tuyển dụng
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Họ và tên:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
              <User size={18} color="var(--text-muted)" />
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Email:</label>
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
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Đang xử lý...' : <>Đăng ký tài khoản <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
