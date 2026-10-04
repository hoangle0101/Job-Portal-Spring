import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fileService, applicationService, jobService, candidateService } from '../services/jobPortalService';
import { fileUrl, formatDate } from '../utils/format';
import Icon from '../components/common/Icon';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import CompanyLogo from '../components/common/CompanyLogo';
import StatusBadge from '../components/common/StatusBadge';

const ALLOWED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export default function JobDetail() {
  const { id } = useParams();
  const { user, isSeeker } = useAuth();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Dữ liệu riêng của ứng viên: đơn đã nộp vào tin này + CV mặc định trong hồ sơ
  const [myApplication, setMyApplication] = useState(null);
  const [defaultCv, setDefaultCv] = useState('');

  const [cvMode, setCvMode] = useState('upload'); // 'default' | 'upload'
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setLoadingJob(true);
    setLoadError('');
    jobService.getJobById(id)
      .then(setJob)
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoadingJob(false));
  }, [id]);

  useEffect(() => {
    if (!isSeeker) return;
    applicationService.getMyApplications()
      .then((apps) => setMyApplication((apps || []).find((a) => String(a.jobListingId) === String(id)) || null))
      .catch(() => { });
    candidateService.getMyProfile()
      .then((profile) => {
        if (profile?.resumeUrl) {
          setDefaultCv(profile.resumeUrl);
          setCvMode('default');
        }
      })
      .catch(() => { });
  }, [id, isSeeker]);

  const handleApply = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cvMode === 'upload') {
      if (!selectedFile) {
        setErrorMsg('Vui lòng chọn file CV (PDF, DOC, DOCX).');
        return;
      }
      const extension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_CV_EXTENSIONS.includes(extension)) {
        setErrorMsg('CV chỉ chấp nhận định dạng PDF, DOC hoặc DOCX.');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Bước 1: upload file CV (nếu chọn CV mới) -> nhận về đường dẫn file
      let resumeUrl = '';
      if (cvMode === 'upload') {
        const uploaded = await fileService.uploadFile(selectedFile, 'resumes');
        resumeUrl = uploaded.fileUrl;
      }
      // Bước 2: nộp đơn (resumeUrl rỗng = backend dùng CV mặc định trong hồ sơ)
      setMyApplication(await applicationService.applyJob(id, { resumeUrl, coverLetter }));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Nội dung khung "Ứng tuyển" tùy theo vai trò và trạng thái
  const renderApplyPanel = () => {
    if (myApplication) {
      return (
        <>
          <p className="apply-done">Bạn đã ứng tuyển vị trí này.</p>
          <p className="text-small text-secondary">Trạng thái hiện tại: <StatusBadge status={myApplication.status} /></p>
          <Link to="/my-applications" className="btn btn-secondary btn-block apply-panel-action">Theo dõi đơn ứng tuyển</Link>
        </>
      );
    }
    if (job.status !== 'OPEN') {
      return <Alert message={{ type: 'info', text: 'Tin tuyển dụng đã đóng, không nhận thêm hồ sơ.' }} />;
    }
    if (!user) {
      return (
        <>
          <p className="text-small text-secondary">Đăng nhập bằng tài khoản ứng viên để nộp hồ sơ.</p>
          <Link to="/login" className="btn btn-primary btn-block apply-panel-action">Đăng nhập để ứng tuyển</Link>
        </>
      );
    }
    if (!isSeeker) {
      return <p className="text-small text-secondary">Chỉ tài khoản ứng viên mới có thể nộp hồ sơ.</p>;
    }

    return (
      <form onSubmit={handleApply}>
        <Alert message={errorMsg ? { type: 'error', text: errorMsg } : null} />

        <div className="form-group">
          <span className="form-label">CV ứng tuyển</span>
          {defaultCv && (
            <>
              <label className="radio-option">
                <input type="radio" name="cvMode" checked={cvMode === 'default'} onChange={() => setCvMode('default')} />
                <span>CV trong hồ sơ (<a href={fileUrl(defaultCv)} target="_blank" rel="noreferrer" className="text-link">xem</a>)</span>
              </label>
              <label className="radio-option">
                <input type="radio" name="cvMode" checked={cvMode === 'upload'} onChange={() => setCvMode('upload')} />
                Tải lên CV khác
              </label>
            </>
          )}
          {cvMode === 'upload' && (
            <label className={`cv-dropzone ${selectedFile ? 'has-file' : ''}`} htmlFor="cv-upload">
              <span className="cv-dropzone-icon"><Icon name="upload" size={21} /></span>
              <span className="cv-dropzone-copy">
                <strong>{selectedFile ? selectedFile.name : 'Chọn CV để tải lên'}</strong>
                <small>{selectedFile ? 'File đã sẵn sàng để gửi' : 'PDF, DOC hoặc DOCX · tối đa 10MB'}</small>
              </span>
              <span className="cv-dropzone-action">{selectedFile ? 'Đổi file' : 'Chọn file'}</span>
              <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" className="cv-input" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </label>
          )}
          <p className="form-hint">Định dạng PDF, DOC, DOCX, tối đa 10MB.</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="coverLetter">Thư giới thiệu</label>
          <textarea
            id="coverLetter"
            rows={5}
            className="form-input"
            placeholder="Vài dòng giới thiệu vì sao bạn phù hợp với vị trí này"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary btn-block btn-lg">
          {submitting ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ ứng tuyển'}
        </button>
      </form>
    );
  };

  if (loadingJob) {
    return <Loading text="Đang tải thông tin việc làm..." />;
  }

  if (loadError || !job) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Không thể tải việc làm"
            text={loadError || 'Việc làm không tồn tại.'}
            action={<Link to="/" className="btn btn-secondary">Quay lại danh sách việc làm</Link>}
          />
        </div>
      </div>
    );
  }

  const description = job.description || {};
  const sections = [
    ['Mô tả công việc', description.responsibilities],
    ['Yêu cầu ứng viên', description.requirements],
    ['Quyền lợi', description.benefits],
  ];

  return (
    <div className="page">
      <div className="container">
        <Link to="/" className="back-link"><Icon name="chevronLeft" size={16} /> Danh sách việc làm</Link>

        <div className="two-column">
          <div>
            {/* Tiêu đề & thông tin chính */}
            <section className="card job-header">
              <div className="job-header-top">
                <CompanyLogo name={job.companyName} logoUrl={job.companyLogo} size={72} />
                <div>
                  <h1 className="job-header-title">{job.title}</h1>
                  <Link to={`/companies/${job.companyId}`} className="job-header-company">{job.companyName}</Link>
                  {job.status !== 'OPEN' && <span className="badge badge-red job-header-closed">Đã đóng</span>}
                </div>
              </div>

              <dl className="job-facts">
                <div>
                  <dt>Mức lương</dt>
                  <dd className="job-salary">{job.salaryRange || 'Thỏa thuận'}</dd>
                </div>
                <div>
                  <dt>Địa điểm</dt>
                  <dd>{job.city || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt>Hình thức</dt>
                  <dd>{job.jobTypeName || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt>Ngày đăng</dt>
                  <dd>{formatDate(job.createdAt)}</dd>
                </div>
              </dl>
            </section>

            {/* Nội dung tin tuyển dụng */}
            <section className="card">
              {sections.filter(([, content]) => content).map(([title, content]) => (
                <div key={title} className="job-section">
                  <h2 className="job-section-title">{title}</h2>
                  <p className="pre-line text-secondary">{content}</p>
                </div>
              ))}
              {job.industryName && (
                <div className="job-section">
                  <h2 className="job-section-title">Ngành nghề</h2>
                  <span className="tag">{job.industryName}</span>
                </div>
              )}
            </section>
          </div>

          <aside className="sidebar-sticky">
            <section className="card">
              <h2 className="card-title">Ứng tuyển</h2>
              {renderApplyPanel()}
            </section>

            <section className="card">
              <h2 className="card-title">Về công ty</h2>
              <p className="company-mini-name">{job.companyName}</p>
              {job.companyWebsite && (
                <a href={job.companyWebsite} target="_blank" rel="noreferrer" className="text-link text-small">{job.companyWebsite}</a>
              )}
              <Link to={`/companies/${job.companyId}`} className="btn btn-secondary btn-block apply-panel-action">Xem trang công ty</Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
