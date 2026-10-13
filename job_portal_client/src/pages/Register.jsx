import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/jobPortalService';
import Alert from '../components/common/Alert';

// Hai loại tài khoản được tự đăng ký (ADMIN do hệ thống tạo)
const ROLE_CHOICES = [
  { value: 'JOB_SEEKER', title: 'Tôi là ứng viên', text: 'Tìm việc, nộp CV và theo dõi tiến trình ứng tuyển.' },
  { value: 'RECRUITER', title: 'Tôi là nhà tuyển dụng', text: 'Tạo trang công ty, đăng tin và quản lý ứng viên.' },
];

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'JOB_SEEKER' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await authService.register(form);
      login(user);
      navigate(user.role === 'RECRUITER' ? '/recruiter/dashboard' : '/');
    } catch (error) {
      setErrorMsg(error.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-subtitle">Miễn phí, chỉ mất chưa đến một phút.</p>

        <Alert message={errorMsg ? { type: 'error', text: errorMsg } : null} />

        <form onSubmit={handleSubmit}>
          <div className="role-choices">
            {ROLE_CHOICES.map((choice) => (
              <label key={choice.value} className={`role-choice ${form.role === choice.value ? 'selected' : ''}`}>
                <input type="radio" name="role" value={choice.value} checked={form.role === choice.value}
                  onChange={() => updateField('role', choice.value)} />
                <span className="role-choice-title">{choice.title}</span>
                <span className="role-choice-text">{choice.text}</span>
              </label>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Họ và tên <span className="required">*</span></label>
            <input id="fullName" className="form-input" required placeholder="Nguyễn Văn A"
              value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email <span className="required">*</span></label>
              <input id="email" type="email" className="form-input" required placeholder="ten@email.com"
                value={form.email} onChange={(e) => updateField('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Số điện thoại</label>
              <input id="phone" type="tel" className="form-input" placeholder="0912 345 678"
                value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu <span className="required">*</span></label>
            <input id="password" type="password" className="form-input" required minLength={6} placeholder="Tối thiểu 6 ký tự"
              value={form.password} onChange={(e) => updateField('password', e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login" className="text-link">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
