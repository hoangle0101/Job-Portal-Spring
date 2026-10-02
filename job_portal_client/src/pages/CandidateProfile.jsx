import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService, candidateService, hiringService } from '../services/jobPortalService';
import { APPLICATION_STATUS, APPLICATION_STEPS, fileUrl, formatDate, formatDateTime, formatSalary } from '../utils/format';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';

const emptyProfile = { bio: '', skills: '', education: '', experience: '', resumeUrl: '' };

const PROFILE_FIELDS = [
  { name: 'bio', label: 'Giới thiệu bản thân', placeholder: 'Định hướng nghề nghiệp, điểm mạnh...', rows: 4 },
  { name: 'skills', label: 'Kỹ năng', placeholder: 'Java, Spring Boot, React, SQL...', rows: 2 },
  { name: 'education', label: 'Học vấn', placeholder: 'Trường, chuyên ngành, năm tốt nghiệp...', rows: 3 },
  { name: 'experience', label: 'Kinh nghiệm làm việc', placeholder: 'Công ty, vị trí, dự án đã tham gia...', rows: 4 },
];

// Thanh tiến trình: Nộp hồ sơ -> Vòng hồ sơ -> Phỏng vấn -> Offer -> Nhận việc
function ApplicationProgress({ status }) {
  const currentStep = APPLICATION_STATUS[status]?.step;
  if (!currentStep) return null; // đơn đã bị từ chối / từ chối Offer thì không hiện

  return (
    <ol className="progress-steps">
      {APPLICATION_STEPS.map((label, index) => (
        <li key={label} className={index < currentStep ? 'done' : ''}>{label}</li>
      ))}
    </ol>
  );
}

export default function CandidateProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'profile'
  const [profile, setProfile] = useState(emptyProfile);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);

  // Hồ sơ + đơn ứng tuyển chỉ cần 2 request (backend đã trả kèm tên job, công ty, lịch PV, offer)
  const loadPage = async () => {
    try {
      const [profileData, applicationData] = await Promise.all([
        candidateService.getMyProfile(),
        applicationService.getMyApplications(),
      ]);
      setProfile({ ...emptyProfile, ...profileData });
      setApplications(applicationData || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { bio, skills, education, experience } = profile;
      const saved = await candidateService.saveMyProfile({ bio, skills, education, experience });
      setProfile({ ...emptyProfile, ...saved });
      setMessage({ type: 'success', text: 'Đã lưu hồ sơ.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const saved = await candidateService.uploadCv(file);
      setProfile({ ...emptyProfile, ...saved });
      setMessage({ type: 'success', text: 'Đã cập nhật CV mặc định.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleWithdraw = async (application) => {
    if (!window.confirm(`Rút hồ sơ ứng tuyển "${application.jobTitle}"?`)) return;
    setBusyId(application.id);
    try {
      await applicationService.withdraw(application.id);
      setApplications((list) => list.filter((a) => a.id !== application.id));
      setMessage({ type: 'success', text: 'Đã rút hồ sơ.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const handleRespondOffer = async (application, status) => {
    const accepted = status === 'ACCEPTED';
    if (!window.confirm(accepted ? 'Xác nhận chấp nhận Offer này?' : 'Xác nhận từ chối Offer này?')) return;
    setBusyId(application.id);
    try {
      await hiringService.respondOffer(application.offer.id, status);
      setMessage({ type: 'success', text: accepted ? 'Chúc mừng! Bạn đã nhận Offer.' : 'Bạn đã từ chối Offer.' });
      await loadPage(); // tải lại để lấy trạng thái mới (HIRED / OFFER_DECLINED)
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  // Thông tin thêm của từng đơn theo trạng thái: lịch phỏng vấn, Offer, lý do từ chối
  const renderApplicationDetail = (app) => {
    const { interview, offer } = app;

    if (app.status === 'INTERVIEW_SCHEDULED' && interview) {
      return (
        <div className="info-box info-box-blue">
          <strong>Lịch phỏng vấn</strong>
          <p>{formatDateTime(interview.startTime)} – {formatDateTime(interview.endTime)}</p>
          {interview.location && <p>Địa điểm: {interview.location}</p>}
          {interview.meetingLink && (
            <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm info-box-action">
              Tham gia phỏng vấn online
            </a>
          )}
        </div>
      );
    }

    if (app.status === 'OFFERED' && offer) {
      return (
        <div className="info-box info-box-green">
          <strong>Bạn nhận được Offer</strong>
          <p>Mức lương: {formatSalary(offer.salary)}</p>
          <p>Ngày bắt đầu: {formatDate(offer.startDate)}</p>
          {offer.notes && <p>Ghi chú: {offer.notes}</p>}
          <div className="info-box-buttons">
            <button type="button" disabled={busyId === app.id} onClick={() => handleRespondOffer(app, 'ACCEPTED')} className="btn btn-primary btn-sm">
              Chấp nhận
            </button>
            <button type="button" disabled={busyId === app.id} onClick={() => handleRespondOffer(app, 'DECLINED')} className="btn btn-secondary btn-sm">
              Từ chối
            </button>
          </div>
        </div>
      );
    }

    if (app.status === 'HIRED' && offer) {
      return (
        <div className="info-box info-box-green">
          Bạn đã nhận việc với mức lương {formatSalary(offer.salary)}, bắt đầu từ {formatDate(offer.startDate)}.
        </div>
      );
    }

    if (app.status === 'REJECTED' && app.rejectionReason) {
      return <div className="info-box info-box-gray">Phản hồi từ nhà tuyển dụng: {app.rejectionReason}</div>;
    }
    return null;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Hồ sơ & ứng tuyển</h1>
            <p className="page-subtitle">Theo dõi tiến trình ứng tuyển và cập nhật hồ sơ của bạn.</p>
          </div>
        </div>

        <Alert message={message} onClose={() => setMessage(null)} />

        <div className="tabs">
          <button type="button" className={`tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
            Việc làm đã ứng tuyển ({applications.length})
          </button>
          <button type="button" className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Hồ sơ của tôi
          </button>
        </div>

        {/* Tab 1: danh sách đơn ứng tuyển */}
        {activeTab === 'applications' && (
          applications.length === 0 ? (
            <EmptyState
              title="Bạn chưa ứng tuyển công việc nào"
              text="Tìm công việc phù hợp và nộp hồ sơ ngay."
              action={<Link to="/" className="btn btn-primary">Tìm việc làm</Link>}
            />
          ) : (
            <div className="application-list">
              {applications.map((app) => (
                <article key={app.id} className="card application">
                  <div className="application-header">
                    <div>
                      <Link to={`/jobs/${app.jobListingId}`} className="application-title">{app.jobTitle}</Link>
                      <Link to={`/companies/${app.companyId}`} className="application-company">{app.companyName}</Link>
                      <p className="text-small text-muted">Nộp ngày {formatDate(app.createdAt)}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <ApplicationProgress status={app.status} />
                  {renderApplicationDetail(app)}

                  {/* Chỉ rút được khi nhà tuyển dụng chưa xử lý */}
                  {app.status === 'APPLIED' && (
                    <button type="button" disabled={busyId === app.id} onClick={() => handleWithdraw(app)} className="btn-link link-danger application-withdraw">
                      Rút hồ sơ
                    </button>
                  )}
                </article>
              ))}
            </div>
          )
        )}

        {/* Tab 2: hồ sơ ứng viên */}
        {activeTab === 'profile' && (
          <div className="two-column">
            <form className="card" onSubmit={handleSaveProfile}>
              <h2 className="card-title">Thông tin hồ sơ</h2>
              {PROFILE_FIELDS.map((field) => (
                <div key={field.name} className="form-group">
                  <label className="form-label" htmlFor={field.name}>{field.label}</label>
                  <textarea id={field.name} className="form-input" rows={field.rows} placeholder={field.placeholder}
                    value={profile[field.name] || ''} onChange={(e) => setProfile({ ...profile, [field.name]: e.target.value })} />
                </div>
              ))}
              <div className="form-actions">
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
              </div>
            </form>

            <aside>
              <section className="card">
                <h2 className="card-title">CV mặc định</h2>
                <p className="text-small text-secondary">CV này được dùng khi bạn ứng tuyển mà không tải CV khác.</p>
                {profile.resumeUrl ? (
                  <a href={fileUrl(profile.resumeUrl)} target="_blank" rel="noreferrer" className="cv-file">Xem CV hiện tại</a>
                ) : (
                  <p className="cv-file cv-file-empty">Chưa có CV</p>
                )}
                <label className="btn btn-secondary btn-block">
                  {uploading ? 'Đang tải lên...' : profile.resumeUrl ? 'Thay CV khác' : 'Tải lên CV'}
                  <input type="file" accept=".pdf,.doc,.docx" hidden onChange={handleUploadCv} disabled={uploading} />
                </label>
                <p className="form-hint">PDF, DOC, DOCX, tối đa 10MB.</p>
              </section>

              <section className="card">
                <h2 className="card-title">Thông tin liên hệ</h2>
                <dl className="info-list">
                  <div><dt>Họ và tên</dt><dd>{user.fullName}</dd></div>
                  <div><dt>Email</dt><dd>{user.email}</dd></div>
                  <div><dt>Số điện thoại</dt><dd>{user.phone || 'Chưa cập nhật'}</dd></div>
                </dl>
                <Link to="/account" className="btn-link text-small info-list-edit">Sửa thông tin tài khoản</Link>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
