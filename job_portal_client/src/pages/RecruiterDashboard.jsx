import React, { useState } from 'react';
import { PlusCircle, Users, CheckCircle, Calendar, Send, FileText } from 'lucide-react';

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('applicants');

  const applicants = [
    { id: 1, name: 'Nguyễn Văn A', job: 'Senior Java Spring Boot Engineer', status: 'APPLIED', date: '10/10/2026', resume: 'cv_nguyen_van_a.pdf' },
    { id: 2, name: 'Trần Thị B', job: 'React Frontend Developer', status: 'SHORTLISTED', date: '09/10/2026', resume: 'cv_tran_thi_b.pdf' },
    { id: 3, name: 'Lê Hoàng C', job: 'Senior Java Spring Boot Engineer', status: 'INTERVIEW_SCHEDULED', date: '08/10/2026', resume: 'cv_le_hoang_c.pdf' },
  ];

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Bảng điều khiển Nhà tuyển dụng</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Quản lý tin tuyển dụng và theo dõi quy trình ứng viên (Shortlist, Phỏng vấn, Offer)</p>
        </div>
        <button className="btn btn-primary">
          <PlusCircle size={16} /> Đăng tin tuyển dụng mới
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('applicants')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'applicants' ? '2px solid var(--primary)' : 'none', fontWeight: '700', color: activeTab === 'applicants' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          Ứng viên đã nộp ({applicants.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'jobs' ? '2px solid var(--primary)' : 'none', fontWeight: '700', color: activeTab === 'jobs' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          Tin tuyển dụng của tôi (3)
        </button>
      </div>

      {/* Applicants Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px' }}>Ứng viên</th>
              <th style={{ padding: '14px 20px' }}>Vị trí ứng tuyển</th>
              <th style={{ padding: '14px 20px' }}>Ngày nộp</th>
              <th style={{ padding: '14px 20px' }}>CV File</th>
              <th style={{ padding: '14px 20px' }}>Trạng thái</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 20px', fontWeight: '600' }}>{a.name}</td>
                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{a.job}</td>
                <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{a.date}</td>
                <td style={{ padding: '16px 20px' }}>
                  <a href="#" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                    <FileText size={14} /> Xem CV
                  </a>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span className={`badge ${a.status === 'APPLIED' ? 'badge-primary' : a.status === 'SHORTLISTED' ? 'badge-warning' : 'badge-success'}`}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} title="Duyệt vào danh sách rút gọn">
                      <CheckCircle size={14} color="#10b981" /> Shortlist
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} title="Hẹn lịch phỏng vấn">
                      <Calendar size={14} color="#4f46e5" /> Hẹn phỏng vấn
                    </button>
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} title="Gửi thư mời làm việc">
                      <Send size={14} /> Gửi Offer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
