import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, PlusCircle, FileText } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout, isRecruiter, isSeeker } = useAuth();

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Briefcase size={22} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>Job<span style={{ color: 'var(--primary)' }}>Portal</span></span>
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
              <NotificationBell userId={user.id} />

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
