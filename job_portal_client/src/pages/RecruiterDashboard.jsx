import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  jobService,
  companyService,
  applicationService,
  hiringService
} from '../services/jobPortalService';
import {
  PlusCircle,
  Users,
  CheckCircle,
  Calendar,
  Send,
  FileText,
  Building2,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  ExternalLink,
  X,
  Filter,
  DollarSign,
  MapPin,
  Star
} from 'lucide-react';

const resolveFileUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http')) return url;
  return `http://localhost:8080${url}`;
};

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '0 VNĐ';
  return `${new Intl.NumberFormat('vi-VN').format(val)} VNĐ/tháng`;
};

const formatDate = (val) => {
  if (!val) return 'Chưa cập nhật';
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(val));
  } catch {
    return val;
  }
};

const statusLabels = {
  APPLIED: 'Chờ duyệt',
  SHORTLISTED: 'Đã rút gọn',
  INTERVIEW_SCHEDULED: 'Lịch phỏng vấn',
  OFFERED: 'Đã gửi Offer',
  ACCEPTED: 'Đã nhận việc',
  DECLINED: 'Đã từ chối',
  REJECTED: 'Không đạt'
};

const statusBadges = {
  APPLIED: 'badge-neutral',
  SHORTLISTED: 'badge-primary',
  INTERVIEW_SCHEDULED: 'badge-primary',
  OFFERED: 'badge-warning',
  ACCEPTED: 'badge-success',
  DECLINED: 'badge-danger',
  REJECTED: 'badge-danger'
};

export default function RecruiterDashboard() {
  const { user, isRecruiter } = useAuth();
  const recruiterId = user?.id;

  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'jobs' | 'company'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data states
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [applications, setApplications] = useState([]);

  // Filtering
  const [filterJobId, setFilterJobId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals state
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [activeAppModal, setActiveAppModal] = useState(null); // { type: 'SHORTLIST'|'INTERVIEW'|'FEEDBACK'|'OFFER', app: {} }
  const [actionLoading, setActionLoading] = useState(false);

  // Forms data
  const [jobForm, setJobForm] = useState({
    title: '',
    companyId: '',
    industryId: '',
    jobTypeId: '',
    salaryRange: '20,000,000 - 35,000,000 VNĐ',
    responsibilities: '',
    requirements: '',
    benefits: ''
  });

  const [companyForm, setCompanyForm] = useState({
    name: '',
    website: 'https://',
    address: 'Hà Nội',
    city: 'Hà Nội',
    description: ''
  });

  const [shortlistNote, setShortlistNote] = useState('Hồ sơ ứng viên rất tiềm năng.');
  const [interviewForm, setInterviewForm] = useState({
    startTime: '',
    endTime: '',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    location: 'Trực tuyến Google Meet'
  });

  const [feedbackForm, setFeedbackForm] = useState({
    score: 85,
    comments: 'Ứng viên nắm chắc kiến trúc Java Spring Boot và giao tiếp tốt.',
    result: 'PASS'
  });

  const [offerForm, setOfferForm] = useState({
    salary: 28000000,
    startDate: '',
    notes: 'Chào mừng bạn gia nhập đội ngũ phát triển phần mềm.'
  });

  // Tải toàn bộ dữ liệu của Nhà tuyển dụng
  const loadRecruiterData = async () => {
    if (!recruiterId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Tải Metadata: Doanh nghiệp, Tin tuyển dụng, Ngành nghề, Loại hình
      const [compsRes, jobsRes, indRes, typesRes] = await Promise.all([
        companyService.getCompaniesByRecruiter(recruiterId).catch(() => []),
        jobService.getJobsByRecruiter(recruiterId).catch(() => []),
        companyService.getIndustries().catch(() => []),
        companyService.getJobTypes().catch(() => [])
      ]);

      setCompanies(compsRes || []);
      setJobs(jobsRes || []);
      setIndustries(indRes || []);
      setJobTypes(typesRes || []);

      // Thiết lập mặc định cho form tạo job
      if (compsRes?.length > 0) {
        setJobForm(prev => ({
          ...prev,
          companyId: prev.companyId || compsRes[0].id,
          industryId: prev.industryId || (indRes?.[0]?.id || 1),
          jobTypeId: prev.jobTypeId || (typesRes?.[0]?.id || 1)
        }));
      }

      // 2. Tải tất cả đơn ứng tuyển từ các Job của Recruiter
      if (jobsRes && jobsRes.length > 0) {
        const appsPromises = jobsRes.map(job =>
          applicationService.getJobApplications(job.id, recruiterId)
            .then(appList => (appList || []).map(a => ({ ...a, job })))
            .catch(() => [])
        );
        const appsResults = await Promise.all(appsPromises);
        setApplications(appsResults.flat());
      } else {
        setApplications([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể tải dữ liệu bảng điều khiển.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiterData();
  }, [recruiterId]);

  // Xử lý tạo công ty mới
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        recruiterId,
        name: companyForm.name,
        website: companyForm.website,
        description: companyForm.description,
        locations: [
          { address: companyForm.address, city: companyForm.city, country: 'Việt Nam' }
        ]
      };
      const created = await companyService.createCompany(payload);
      setCompanies(prev => [...prev, created]);
      setJobForm(prev => ({ ...prev, companyId: created.id }));
      setShowCompanyModal(false);
      setSuccessMsg(`Đã tạo thành công công ty "${created.name}".`);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể tạo công ty.');
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý đăng tin tuyển dụng mới
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobForm.companyId) {
      setErrorMsg('Vui lòng tạo hoặc chọn một Công ty trước khi đăng tin.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        recruiterId,
        companyId: Number(jobForm.companyId),
        industryId: Number(jobForm.industryId || 1),
        jobTypeId: Number(jobForm.jobTypeId || 1),
        title: jobForm.title,
        salaryRange: jobForm.salaryRange,
        responsibilities: jobForm.responsibilities,
        requirements: jobForm.requirements,
        benefits: jobForm.benefits
      };

      const newJob = await jobService.createJob(payload);
      setJobs(prev => [newJob, ...prev]);
      setShowCreateJobModal(false);
      setSuccessMsg(`Đã đăng thành công tin tuyển dụng "${newJob.title}".`);
      // Reset form
      setJobForm(prev => ({
        ...prev,
        title: '',
        responsibilities: '',
        requirements: '',
        benefits: ''
      }));
    } catch (err) {
      setErrorMsg(err.message || 'Không thể đăng tin tuyển dụng.');
    } finally {
      setActionLoading(false);
    }
  };

  // 1. Hành động Shortlist
  const handleShortlist = async (app) => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      await hiringService.shortlist(app.id, {
        recruiterId,
        note: shortlistNote
      });
      setSuccessMsg(`Đã duyệt hồ sơ #${app.id} vào danh sách rút gọn (Shortlist).`);
      setActiveAppModal(null);
      await loadRecruiterData();
    } catch (err) {
      setErrorMsg(err.message || 'Không thể Shortlist hồ sơ.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Hành động Lên lịch phỏng vấn
  const handleScheduleInterview = async (app) => {
    if (!interviewForm.startTime || !interviewForm.endTime) {
      setErrorMsg('Vui lòng chọn thời gian bắt đầu và kết thúc phỏng vấn.');
      return;
    }
    setActionLoading(true);
    setErrorMsg('');
    try {
      await hiringService.scheduleInterview({
        applicationId: app.id,
        recruiterId,
        startTime: interviewForm.startTime,
        endTime: interviewForm.endTime,
        meetingLink: interviewForm.meetingLink,
        location: interviewForm.location
      });
      setSuccessMsg(`Đã lên lịch phỏng vấn thành công cho đơn #${app.id}.`);
      setActiveAppModal(null);
      await loadRecruiterData();
    } catch (err) {
      setErrorMsg(err.message || 'Không thể lên lịch phỏng vấn.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Hành động Chấm điểm phỏng vấn
  const handleFeedback = async (app) => {
    const slotId = app.interview?.id;
    if (!slotId) {
      setErrorMsg('Không tìm thấy mã lịch phỏng vấn để gửi nhận xét.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    try {
      await hiringService.submitFeedback(slotId, {
        interviewerId: recruiterId,
        score: Number(feedbackForm.score),
        comments: feedbackForm.comments,
        result: feedbackForm.result
      });
      setSuccessMsg(`Đã lưu kết quả phỏng vấn (${feedbackForm.result}) cho đơn #${app.id}.`);
      setActiveAppModal(null);
      await loadRecruiterData();
    } catch (err) {
      setErrorMsg(err.message || 'Không thể gửi kết quả phỏng vấn.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Hành động Gửi Offer
  const handleSendOffer = async (app) => {
    if (!offerForm.startDate) {
      setErrorMsg('Vui lòng chọn ngày bắt đầu đi làm.');
      return;
    }
    setActionLoading(true);
    setErrorMsg('');
    try {
      await hiringService.createOffer(app.id, {
        recruiterId,
        salary: Number(offerForm.salary),
        startDate: offerForm.startDate,
        notes: offerForm.notes
      });
      setSuccessMsg(`Đã gửi Offer mức lương ${formatCurrency(offerForm.salary)} thành công cho đơn #${app.id}.`);
      setActiveAppModal(null);
      await loadRecruiterData();
    } catch (err) {
      setErrorMsg(err.message || 'Không thể gửi Offer.');
    } finally {
      setActionLoading(false);
    }
  };

  // Đóng tin tuyển dụng
  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Bạn có chắc chắn muốn đóng tin tuyển dụng này?')) return;
    try {
      await jobService.closeJob(jobId);
      setSuccessMsg(`Đã đóng tin tuyển dụng #${jobId}.`);
      await loadRecruiterData();
    } catch (err) {
      setErrorMsg(err.message || 'Không thể đóng tin.');
    }
  };

  // Kiểm tra quyền Recruiter
  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <Briefcase size={40} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Yêu cầu đăng nhập Nhà tuyển dụng</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Bạn cần đăng nhập bằng tài khoản Recruiter để quản lý tin tuyển dụng và ứng viên.
        </p>
        <Link to="/login" className="btn btn-primary">Đăng nhập ngay</Link>
      </div>
    );
  }

  // Lọc danh sách ứng viên
  const filteredApplicants = applications.filter(app => {
    const matchJob = filterJobId === 'ALL' || String(app.jobListingId) === String(filterJobId);
    const matchStatus = filterStatus === 'ALL' || app.status === filterStatus;
    return matchJob && matchStatus;
  });

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '85vh' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Bảng điều khiển Nhà tuyển dụng</h1>
            <span className="badge badge-primary">{user.fullName || user.email}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Quản lý tin tuyển dụng, sàng lọc hồ sơ và điều phối quy trình phỏng vấn chuẩn hóa
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {companies.length === 0 ? (
            <button
              onClick={() => setShowCompanyModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Building2 size={16} /> Tạo hồ sơ Công ty
            </button>
          ) : (
            <button
              onClick={() => setShowCreateJobModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <PlusCircle size={16} /> Đăng tin tuyển dụng mới
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#b91c1c' }}><X size={16} /></button>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#065f46' }}><X size={16} /></button>
        </div>
      )}

      {/* Stat KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Tổng tin tuyển dụng</span>
          <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: 'var(--primary)' }}>{jobs.length}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Hồ sơ ứng tuyển</span>
          <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: '#0284c7' }}>{applications.length}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Đang phỏng vấn</span>
          <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: '#eab308' }}>
            {applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length}
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Offer thành công</span>
          <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: '#10b981' }}>
            {applications.filter(a => a.status === 'ACCEPTED').length}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('applicants')}
          style={{ padding: '12px 18px', background: 'none', border: 'none', borderBottom: activeTab === 'applicants' ? '2px solid var(--primary)' : 'none', fontWeight: '700', fontSize: '15px', color: activeTab === 'applicants' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          Ứng viên đã nộp ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{ padding: '12px 18px', background: 'none', border: 'none', borderBottom: activeTab === 'jobs' ? '2px solid var(--primary)' : 'none', fontWeight: '700', fontSize: '15px', color: activeTab === 'jobs' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          Tin tuyển dụng của tôi ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('company')}
          style={{ padding: '12px 18px', background: 'none', border: 'none', borderBottom: activeTab === 'company' ? '2px solid var(--primary)' : 'none', fontWeight: '700', fontSize: '15px', color: activeTab === 'company' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          Hồ sơ Doanh nghiệp ({companies.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <LoaderCircle size={32} className="spin" style={{ margin: '0 auto 12px' }} />
          <p>Đang tải dữ liệu tuyển dụng...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: DANH SÁCH ỨNG VIÊN */}
          {activeTab === 'applicants' && (
            <div>
              {/* Filter Row */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                  <Filter size={16} /> Lọc theo tin:
                </div>
                <select
                  value={filterJobId}
                  onChange={(e) => setFilterJobId(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-surface)' }}
                >
                  <option value="ALL">Tất cả tin tuyển dụng</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-surface)' }}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="APPLIED">Chờ duyệt (APPLIED)</option>
                  <option value="SHORTLISTED">Đã rút gọn (SHORTLISTED)</option>
                  <option value="INTERVIEW_SCHEDULED">Đang phỏng vấn</option>
                  <option value="OFFERED">Đã gửi Offer</option>
                  <option value="ACCEPTED">Đã nhận việc</option>
                  <option value="DECLINED">Đã từ chối</option>
                </select>

                <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  Hiển thị {filteredApplicants.length} hồ sơ
                </span>
              </div>

              {filteredApplicants.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px 24px', color: 'var(--text-secondary)' }}>
                  <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Chưa có ứng viên nào phù hợp bộ lọc</h3>
                  <p style={{ fontSize: '13px', marginTop: '6px' }}>Khi ứng viên nộp CV vào tin tuyển dụng của bạn, hồ sơ sẽ hiển thị ở đây.</p>
                </div>
              ) : (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '14px 18px' }}>Ứng viên</th>
                          <th style={{ padding: '14px 18px' }}>Vị trí ứng tuyển</th>
                          <th style={{ padding: '14px 18px' }}>Ngày nộp</th>
                          <th style={{ padding: '14px 18px' }}>CV & Thư</th>
                          <th style={{ padding: '14px 18px' }}>Trạng thái</th>
                          <th style={{ padding: '14px 18px', textAlign: 'right' }}>Quy trình tuyển dụng (Action)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplicants.map((a) => {
                          const candidateTitle = a.candidateName || a.candidateEmail || `Ứng viên #${a.candidateId}`;
                          const jobTitle = a.job?.title || `Mã tin #${a.jobListingId}`;

                          return (
                            <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{candidateTitle}</div>
                                {a.candidateEmail && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.candidateEmail}</div>}
                                {a.candidatePhone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.candidatePhone}</div>}
                              </td>

                              <td style={{ padding: '16px 18px', color: 'var(--text-secondary)' }}>
                                <div style={{ fontWeight: '600' }}>{jobTitle}</div>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mã đơn: #{a.id}</span>
                              </td>

                              <td style={{ padding: '16px 18px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                {formatDate(a.createdAt)}
                              </td>

                              <td style={{ padding: '16px 18px' }}>
                                <a
                                  href={resolveFileUrl(a.resumeUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '13px' }}
                                >
                                  <FileText size={14} /> Tải CV <ExternalLink size={12} />
                                </a>
                                {a.coverLetter && (
                                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.coverLetter}>
                                    Thư: "{a.coverLetter}"
                                  </div>
                                )}
                              </td>

                              <td style={{ padding: '16px 18px' }}>
                                <span className={`badge ${statusBadges[a.status] || 'badge-neutral'}`}>
                                  {statusLabels[a.status] || a.status}
                                </span>
                              </td>

                              <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                  {/* Bước 1: Shortlist */}
                                  {a.status === 'APPLIED' && (
                                    <button
                                      onClick={() => setActiveAppModal({ type: 'SHORTLIST', app: a })}
                                      className="btn btn-outline"
                                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <CheckCircle size={14} color="#10b981" /> Shortlist
                                    </button>
                                  )}

                                  {/* Bước 2: Hẹn phỏng vấn */}
                                  {a.status === 'SHORTLISTED' && (
                                    <button
                                      onClick={() => setActiveAppModal({ type: 'INTERVIEW', app: a })}
                                      className="btn btn-outline"
                                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Calendar size={14} color="#4f46e5" /> Hẹn phỏng vấn
                                    </button>
                                  )}

                                  {/* Bước 3: Đang phỏng vấn -> Chấm điểm hoặc Gửi Offer */}
                                  {a.status === 'INTERVIEW_SCHEDULED' && (
                                    <>
                                      {/* Chấm điểm feedback nếu slot chưa hoàn thành */}
                                      {(!a.interview || a.interview.status !== 'COMPLETED') ? (
                                        <button
                                          onClick={() => setActiveAppModal({ type: 'FEEDBACK', app: a })}
                                          className="btn btn-outline"
                                          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                          <Star size={14} color="#eab308" /> Chấm điểm PV
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => setActiveAppModal({ type: 'OFFER', app: a })}
                                          className="btn btn-primary"
                                          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                          <Send size={14} /> Gửi Offer
                                        </button>
                                      )}
                                    </>
                                  )}

                                  {/* Đã gửi Offer */}
                                  {a.status === 'OFFERED' && (
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                      Chờ ứng viên phản hồi
                                    </span>
                                  )}

                                  {/* Ứng viên chấp nhận */}
                                  {a.status === 'ACCEPTED' && (
                                    <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <CheckCircle2 size={14} /> Đã nhận việc
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUẢN LÝ TIN TUYỂN DỤNG */}
          {activeTab === 'jobs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Danh sách tin đã đăng ({jobs.length})</h2>
                <button
                  onClick={() => setShowCreateJobModal(true)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <PlusCircle size={15} /> Thêm tin mới
                </button>
              </div>

              {jobs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px 24px', color: 'var(--text-secondary)' }}>
                  <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Bạn chưa đăng tin tuyển dụng nào</h3>
                  <p style={{ fontSize: '13px', marginTop: '6px', marginBottom: '16px' }}>
                    Đăng tin để tiếp cận hàng ngàn ứng viên tiềm năng ngay hôm nay.
                  </p>
                  <button onClick={() => setShowCreateJobModal(true)} className="btn btn-primary">
                    Đăng tin ngay
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                  {jobs.map(j => {
                    const jobAppCount = applications.filter(a => a.jobListingId === j.id).length;

                    return (
                      <div key={j.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <span className="badge badge-primary">{j.industryName || 'Việc làm'}</span>
                            <span className={`badge ${j.status === 'OPEN' ? 'badge-success' : 'badge-neutral'}`}>
                              {j.status === 'OPEN' ? 'Đang tuyển' : 'Đã đóng'}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{j.title}</h3>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                            <Building2 size={15} /> {j.companyName || 'Công ty của bạn'}
                          </div>

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            <span className="badge badge-neutral"><DollarSign size={12} /> {j.salaryRange || 'Thỏa thuận'}</span>
                            {j.jobTypeName && <span className="badge badge-neutral"><Briefcase size={12} /> {j.jobTypeName}</span>}
                          </div>

                          <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Số lượng đơn ứng tuyển:</span>
                            <strong style={{ color: 'var(--primary)' }}>{jobAppCount} hồ sơ</strong>
                          </div>
                        </div>

                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Link to={`/jobs/${j.id}`} style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Xem chi tiết <ExternalLink size={12} />
                          </Link>

                          {j.status === 'OPEN' && (
                            <button
                              onClick={() => handleCloseJob(j.id)}
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            >
                              Đóng tin
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: THÔNG TIN CÔNG TY */}
          {activeTab === 'company' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Doanh nghiệp quản lý ({companies.length})</h2>
                <button
                  onClick={() => setShowCompanyModal(true)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <PlusCircle size={15} /> Thêm công ty mới
                </button>
              </div>

              {companies.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px 24px', color: 'var(--text-secondary)' }}>
                  <Building2 size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Bạn chưa tạo hồ sơ doanh nghiệp</h3>
                  <p style={{ fontSize: '13px', marginTop: '6px', marginBottom: '16px' }}>
                    Tạo thông tin công ty để làm đại diện khi đăng các tin tuyển dụng.
                  </p>
                  <button onClick={() => setShowCompanyModal(true)} className="btn btn-primary">
                    Tạo hồ sơ công ty
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                  {companies.map(c => (
                    <div key={c.id} className="card">
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: '#fff', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {c.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '17px', fontWeight: '700' }}>{c.name}</h3>
                          {c.website && (
                            <a href={c.website} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--primary)' }}>
                              {c.website}
                            </a>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '14px' }}>
                        {c.description || 'Chưa cập nhật mô tả chi tiết.'}
                      </p>

                      {c.locations && c.locations.length > 0 && (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} /> {c.locations[0].address}, {c.locations[0].city}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          MODAL 1: ĐĂNG TIN TUYỂN DỤNG MỚI
          ========================================================================= */}
      {showCreateJobModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Đăng tin tuyển dụng mới</h2>
              <button onClick={() => setShowCreateJobModal(false)} style={{ background: 'none', border: 0, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateJob}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Tiêu đề công việc (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Senior Java Spring Boot Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Công ty (*):</label>
                  <select
                    value={jobForm.companyId}
                    onChange={(e) => setJobForm(prev => ({ ...prev, companyId: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-subtle)' }}
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Mức lương dự kiến:</label>
                  <input
                    type="text"
                    placeholder="25,000,000 - 40,000,000 VNĐ"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm(prev => ({ ...prev, salaryRange: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Ngành nghề:</label>
                  <select
                    value={jobForm.industryId}
                    onChange={(e) => setJobForm(prev => ({ ...prev, industryId: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-subtle)' }}
                  >
                    {industries.map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Hình thức làm việc:</label>
                  <select
                    value={jobForm.jobTypeId}
                    onChange={(e) => setJobForm(prev => ({ ...prev, jobTypeId: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-subtle)' }}
                  >
                    {jobTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Mô tả công việc & Trách nhiệm (*):</label>
                <textarea
                  rows={3}
                  required
                  placeholder="- Phát triển các module Backend với Java 17, Spring Boot..."
                  value={jobForm.responsibilities}
                  onChange={(e) => setJobForm(prev => ({ ...prev, responsibilities: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Yêu cầu ứng viên (*):</label>
                <textarea
                  rows={3}
                  required
                  placeholder="- Tối thiểu 1 năm kinh nghiệm làm việc với Java hoặc React..."
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Quyền lợi & Đãi ngộ:</label>
                <textarea
                  rows={2}
                  placeholder="- Thưởng tháng 13, bảo hiểm sức khỏe cao cấp..."
                  value={jobForm.benefits}
                  onChange={(e) => setJobForm(prev => ({ ...prev, benefits: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCreateJobModal(false)} className="btn btn-outline">Hủy</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? <LoaderCircle size={16} className="spin" /> : 'Đăng tin ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: TẠO CÔNG TY MỚI
          ========================================================================= */}
      {showCompanyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Tạo thông tin Doanh nghiệp</h2>
              <button onClick={() => setShowCompanyModal(false)} style={{ background: 'none', border: 0, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateCompany}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Tên công ty (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: FPT Software, VNG..."
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Website công ty:</label>
                <input
                  type="url"
                  placeholder="https://fptsoftware.com"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Thành phố (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="Hà Nội, TP.HCM..."
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, city: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Địa chỉ (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="Quận Cầu Giấy..."
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Mô tả ngắn gọn:</label>
                <textarea
                  rows={2}
                  placeholder="Tập đoàn công nghệ hàng đầu..."
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCompanyModal(false)} className="btn btn-outline">Hủy</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? <LoaderCircle size={16} className="spin" /> : 'Lưu công ty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SHORTLIST / PHỎNG VẤN / CHẤM ĐIỂM / OFFER
          ========================================================================= */}
      {activeAppModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800' }}>
                {activeAppModal.type === 'SHORTLIST' && 'Duyệt hồ sơ vào Shortlist'}
                {activeAppModal.type === 'INTERVIEW' && 'Lên lịch phỏng vấn ứng viên'}
                {activeAppModal.type === 'FEEDBACK' && 'Chấm điểm & Nhận xét phỏng vấn'}
                {activeAppModal.type === 'OFFER' && 'Gửi thư mời nhận việc (Offer)'}
              </h2>
              <button onClick={() => setActiveAppModal(null)} style={{ background: 'none', border: 0, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: '16px', background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
              <div>Ứng viên: <strong>{activeAppModal.app.candidateName || `Mã #${activeAppModal.app.candidateId}`}</strong></div>
              <div>Vị trí: <strong>{activeAppModal.app.job?.title}</strong></div>
            </div>

            {/* Form Shortlist */}
            {activeAppModal.type === 'SHORTLIST' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Ghi chú duyệt hồ sơ:</label>
                <textarea
                  rows={3}
                  value={shortlistNote}
                  onChange={(e) => setShortlistNote(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', marginBottom: '20px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setActiveAppModal(null)} className="btn btn-outline">Hủy</button>
                  <button onClick={() => handleShortlist(activeAppModal.app)} disabled={actionLoading} className="btn btn-primary" style={{ background: '#10b981' }}>
                    {actionLoading ? 'Đang duyệt...' : 'Xác nhận Shortlist'}
                  </button>
                </div>
              </div>
            )}

            {/* Form Phỏng vấn */}
            {activeAppModal.type === 'INTERVIEW' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Bắt đầu (*):</label>
                    <input
                      type="datetime-local"
                      required
                      value={interviewForm.startTime}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, startTime: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Kết thúc (*):</label>
                    <input
                      type="datetime-local"
                      required
                      value={interviewForm.endTime}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, endTime: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Link họp trực tuyến:</label>
                  <input
                    type="url"
                    value={interviewForm.meetingLink}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Địa điểm / Hình thức:</label>
                  <input
                    type="text"
                    value={interviewForm.location}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setActiveAppModal(null)} className="btn btn-outline">Hủy</button>
                  <button onClick={() => handleScheduleInterview(activeAppModal.app)} disabled={actionLoading} className="btn btn-primary">
                    {actionLoading ? 'Đang lưu...' : 'Lưu lịch phỏng vấn'}
                  </button>
                </div>
              </div>
            )}

            {/* Form Chấm điểm feedback */}
            {activeAppModal.type === 'FEEDBACK' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Điểm số (0 - 100):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={feedbackForm.score}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, score: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Kết quả đánh giá:</label>
                    <select
                      value={feedbackForm.result}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, result: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-subtle)' }}
                    >
                      <option value="PASS">PASS (Đạt - Sẵn sàng gửi Offer)</option>
                      <option value="FAIL">FAIL (Không đạt)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Nhận xét chi tiết:</label>
                  <textarea
                    rows={3}
                    value={feedbackForm.comments}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, comments: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setActiveAppModal(null)} className="btn btn-outline">Hủy</button>
                  <button onClick={() => handleFeedback(activeAppModal.app)} disabled={actionLoading} className="btn btn-primary">
                    {actionLoading ? 'Đang lưu...' : 'Lưu kết quả phỏng vấn'}
                  </button>
                </div>
              </div>
            )}

            {/* Form Gửi Offer */}
            {activeAppModal.type === 'OFFER' && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Mức lương đề xuất (VNĐ/tháng) (*):</label>
                  <input
                    type="number"
                    step="500000"
                    required
                    value={offerForm.salary}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, salary: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                    Quy đổi: {formatCurrency(offerForm.salary)}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Ngày bắt đầu đi làm (*):</label>
                  <input
                    type="date"
                    required
                    value={offerForm.startDate}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Ghi chú / Điều khoản Offer:</label>
                  <textarea
                    rows={2}
                    value={offerForm.notes}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, notes: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setActiveAppModal(null)} className="btn btn-outline">Hủy</button>
                  <button onClick={() => handleSendOffer(activeAppModal.app)} disabled={actionLoading} className="btn btn-primary">
                    {actionLoading ? 'Đang gửi...' : 'Gửi Offer chính thức'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
