import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fileService, applicationService, jobService } from '../services/jobPortalService';
import { Building2, Globe2, Briefcase, Upload, CheckCircle2, ArrowLeft, Send, LoaderCircle, AlertCircle } from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    setLoadingJob(true);
    setLoadError('');
    jobService.getJobById(id)
      .then((data) => {
        if (active) setJob(data);
      })
      .catch((error) => {
        if (active) setLoadError(error.message || 'Không thể tải thông tin việc làm.');
      })
      .finally(() => {
        if (active) setLoadingJob(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setErrorMsg('Vui lòng đăng nhập bằng tài khoản ứng viên trước khi nộp hồ sơ.');
      return;
    }

    if (!selectedFile) {
      setErrorMsg('Vui lòng chọn file CV (PDF, DOCX) của bạn!');
      return;
    }

    const allowedExtensions = ['.pdf', '.docx'];
    const fileExtension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setErrorMsg('CV chỉ được chấp nhận định dạng PDF hoặc DOCX.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    try {
      const uploadRes = await fileService.uploadFile(selectedFile, 'resumes');
      const resumeUrl = uploadRes.fileUrl || uploadRes.url || uploadRes.fileName;

      if (!resumeUrl) {
        throw new Error('Backend không trả về đường dẫn CV sau khi upload.');
      }

      await applicationService.applyJob(id, {
        candidateId: user.id,
        resumeUrl,
        coverLetter
      });

      setApplied(true);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể nộp hồ sơ. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const renderDescription = (title, content) => {
    if (!content) return null;

    return (
      <section style={{ marginTop: '28px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{content}</p>
      </section>
    );
  };

  if (loadingJob) {
    return (
      <div className="container" style={{ padding: '72px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <LoaderCircle size={28} className="spin" style={{ margin: '0 auto 12px' }} />
        <p>Đang tải thông tin việc làm...</p>
      </div>
    );
  }

  if (loadError || !job) {
    return (
      <div className="container" style={{ padding: '72px 24px', textAlign: 'center' }}>
        <AlertCircle size={36} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
        <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>Không thể tải việc làm</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{loadError || 'Việc làm không tồn tại.'}</p>
        <Link to="/" className="btn btn-outline"><ArrowLeft size={16} /> Quay lại danh sách</Link>
      </div>
    );
  }

  const companyName = job.companyName || 'Chưa cập nhật công ty';
  const description = job.description || {};

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
        <ArrowLeft size={16} /> Quay lại danh sách việc làm
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

        {/* Main Content */}
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '12px' }}>{job.industryName || 'Việc làm'}</span>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>{job.title}</h1>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '20px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={16} /> {companyName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={16} /> {job.jobTypeName || 'Chưa cập nhật hình thức'}</span>
            </div>

            <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />

            {renderDescription('Mô tả công việc', description.responsibilities)}
            {renderDescription('Yêu cầu ứng viên', description.requirements)}
            {renderDescription('Quyền lợi', description.benefits)}

            <section style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Thông tin công ty</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                <Building2 size={18} color="var(--primary)" />
                <strong style={{ color: 'var(--text-primary)' }}>{companyName}</strong>
              </div>
              {job.companyWebsite && (
                <a href={job.companyWebsite} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginTop: '10px', fontSize: '14px' }}>
                  <Globe2 size={16} /> Xem website công ty
                </a>
              )}
            </section>
          </div>
        </div>

        {/* Sidebar Apply Form */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '96px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Ứng tuyển ngay</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              CV của bạn sẽ được gửi trực tiếp đến Nhà tuyển dụng {companyName}.
            </p>

            {applied ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontWeight: '700', color: '#065f46' }}>Nộp hồ sơ thành công!</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Hồ sơ kèm CV đã được lưu vào hệ thống. Nhà tuyển dụng sẽ xem xét và gửi lịch phỏng vấn sớm nhất.
                </p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '16px', width: '100%' }}>Tiếp tục tìm việc</Link>
              </div>
            ) : (
              <form onSubmit={handleApply}>
                {errorMsg && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Tải lên CV của bạn (.pdf, .docx):</label>
                  <div style={{ border: '2px dashed var(--border)', borderRadius: '10px', padding: '16px', textAlign: 'center', background: 'var(--bg-subtle)', cursor: 'pointer' }}>
                    <Upload size={24} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      style={{ fontSize: '13px', width: '100%' }}
                    />
                  </div>
                  {selectedFile && <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px' }}>Đã chọn: {selectedFile.name}</div>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Thư giới thiệu (Cover Letter):</label>
                  <textarea
                    rows={4}
                    placeholder="Giới thiệu ngắn gọn lý do bạn phù hợp với vị trí này..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', resize: 'vertical' }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  {uploading ? 'Đang gửi hồ sơ...' : <><Send size={16} /> Gửi hồ sơ ứng tuyển</>}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
