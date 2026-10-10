import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, CheckCircle2, XCircle, Clock, Award, Building2, Download } from 'lucide-react';

export default function CandidateProfile() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([
    {
      id: 1,
      jobTitle: 'Senior Java Spring Boot Engineer',
      company: 'FPT Software',
      appliedDate: '10/10/2026',
      status: 'OFFERED',
      interviewDate: '12/10/2026 14:00',
      meetingLink: 'https://meet.google.com/abc-xyz-job',
      offerSalary: '32,000,000 VNĐ/tháng',
      resumeName: 'my_resume_java_dev.pdf',
    },
    {
      id: 2,
      jobTitle: 'React Frontend Developer',
      company: 'VNG Corporation',
      appliedDate: '09/10/2026',
      status: 'INTERVIEW_SCHEDULED',
      interviewDate: '14/10/2026 09:30',
      meetingLink: 'https://meet.google.com/vng-interview',
      offerSalary: null,
      resumeName: 'my_resume_react.pdf',
    },
    {
      id: 3,
      jobTitle: 'Fullstack Developer (Spring & React)',
      company: 'Viettel Telecom',
      appliedDate: '05/10/2026',
      status: 'APPLIED',
      interviewDate: null,
      meetingLink: null,
      offerSalary: null,
      resumeName: 'fullstack_cv.pdf',
    }
  ]);

  const handleRespondOffer = (appId, response) => {
    alert(`Bạn đã ${response === 'ACCEPTED' ? 'ĐỒNG Ý (Chấp nhận)' : 'TỪ CHỐI'} thư mời làm việc!`);
    setApplications(prev =>
      prev.map(app => (app.id === appId ? { ...app, status: response === 'ACCEPTED' ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED' } : app))
    );
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Hồ sơ & Đơn ứng tuyển của tôi</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Theo dõi tiến trình phỏng vấn, nhận phản hồi và phản hồi Offer từ các nhà tuyển dụng
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Left: Candidate Info Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>
              {(user?.fullName || 'N')[0]}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{user?.fullName || 'Nguyễn Văn Ứng Viên'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user?.email || 'ungvien@fpt.edu.vn'}</p>
            <span className="badge badge-primary" style={{ marginTop: '8px' }}>Vai trò: Ứng viên (Job Seeker)</span>
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '16px 0' }} />

          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Kỹ năng chuyên môn (Skills)</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {['Java 17', 'Spring Boot 4', 'MySQL', 'React', 'RESTful API', 'Git Flow'].map(s => (
              <span key={s} style={{ fontSize: '12px', background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>{s}</span>
            ))}
          </div>

          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>File CV mặc định:</h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} color="var(--primary)" /> my_cv_2026.pdf</span>
            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}><Download size={14} /></button>
          </div>
        </div>

        {/* Right: Job Applications & Pipeline Tracking */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
            Tiến trình ứng tuyển ({applications.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.map((app) => (
              <div key={app.id} className="card" style={{ borderLeft: app.status === 'OFFERED' ? '4px solid #10b981' : app.status === 'INTERVIEW_SCHEDULED' ? '4px solid #4f46e5' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>{app.jobTitle}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <Building2 size={16} /> <span>{app.company}</span>
                      <span style={{ color: 'var(--text-muted)' }}>• Nộp ngày {app.appliedDate}</span>
                    </div>
                  </div>

                  <span className={`badge ${
                    app.status === 'OFFERED' || app.status === 'OFFER_ACCEPTED'
                      ? 'badge-success'
                      : app.status === 'INTERVIEW_SCHEDULED'
                      ? 'badge-primary'
                      : 'badge-neutral'
                  }`}>
                    {app.status}
                  </span>
                </div>

                {/* Offer Section */}
                {app.status === 'OFFERED' && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '16px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: '700', marginBottom: '6px' }}>
                      <Award size={18} /> Chúc mừng! Bạn đã nhận được Lời mời nhận việc (Offer)
                    </div>
                    <p style={{ fontSize: '14px', color: '#047857', marginBottom: '12px' }}>
                      Mức lương đề xuất: <strong>{app.offerSalary}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleRespondOffer(app.id, 'ACCEPTED')} className="btn btn-primary" style={{ background: '#10b981', padding: '8px 16px', fontSize: '13px' }}>
                        <CheckCircle2 size={15} /> Chấp nhận Offer
                      </button>
                      <button onClick={() => handleRespondOffer(app.id, 'DECLINED')} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '13px' }}>
                        <XCircle size={15} /> Từ chối
                      </button>
                    </div>
                  </div>
                )}

                {/* Interview Section */}
                {app.status === 'INTERVIEW_SCHEDULED' && (
                  <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '14px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3730a3', fontSize: '13px', fontWeight: '600' }}>
                      <Calendar size={18} color="#4f46e5" />
                      <span>Lịch phỏng vấn: {app.interviewDate}</span>
                    </div>
                    <a href={app.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                      Tham gia phỏng vấn
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
