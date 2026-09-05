import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkHealth } from '../services/jobPortalService';
import { Briefcase, User, LogOut, CheckCircle, AlertCircle, PlusCircle, FileText } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isRecruiter, isSeeker, switchRole } = useAuth();
  const navigate = useNavigate();
  const [beOnline, setBeOnline] = useState(false);

  useEffect(() => {
    checkHealth()
      .then(() => setBeOnline(true))
      .catch(() => setBeOnline(false));
  }, []);

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>Job<span style={{ color: 'var(--primary)' }}>Portal</span></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: beOnline ? '#10b981' : '#f59e0b' }}>
              {beOnline ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
              <span>Backend {beOnline ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '14px', fontWeight: '600' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Tìm việc làm</Link>
          <Link to="/companies" style={{ color: 'var(--text-secondary)' }}>Công ty</Link>
          
          {isRecruiter && (
            <Link to="/recruiter/dashboard" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={16} /> Tuyển dụng & Đăng tin
            </Link>
          )}

          {isSeeker && user && (
            <Link to="/my-applications" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} /> Đơn đã nộp
            </Link>
          )}
        </nav>

        {/* User Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Role Switcher Badge (Rất tiện cho Demo giáo viên) */}
              <select
                value={user.role}
                onChange={(e) => switchRole(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: '600', background: 'var(--bg-subtle)' }}
              >
                <option value="JOB_SEEKER">Role: Ứng viên (Seeker)</option>
                <option value="RECRUITER">Role: Nhà tuyển dụng</option>
                <option value="ADMIN">Role: Admin</option>
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
                <span className="badge badge-primary">{user.fullName || user.email}</span>
                <button onClick={logout} className="btn btn-outline" style={{ padding: '6px 12px' }} title="Đăng xuất">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn btn-outline">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng ký</Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
