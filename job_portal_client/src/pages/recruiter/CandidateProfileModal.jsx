import { fileUrl } from '../../utils/format';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';

const PROFILE_SECTIONS = [
  ['Giới thiệu', 'bio'],
  ['Kỹ năng', 'skills'],
  ['Học vấn', 'education'],
  ['Kinh nghiệm', 'experience'],
];

// Xem hồ sơ của ứng viên đã nộp đơn. profile = CandidateProfileResponse, application = đơn đang xem
export default function CandidateProfileModal({ profile, application, onClose }) {
  return (
    <Modal title="Hồ sơ ứng viên" onClose={onClose} size="lg">
      <div className="candidate-summary">
        <div>
          <h3 className="candidate-name">{profile.fullName}</h3>
          <p className="text-small text-muted">{profile.email} · {profile.phone || 'Chưa có số điện thoại'}</p>
          <p className="text-small text-secondary">Ứng tuyển: {application.jobTitle}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {PROFILE_SECTIONS.map(([label, key]) => (
        <div key={key} className="profile-section">
          <h4 className="profile-section-title">{label}</h4>
          <p className="pre-line text-secondary">{profile[key] || 'Chưa cập nhật'}</p>
        </div>
      ))}

      {application.coverLetter && (
        <div className="profile-section">
          <h4 className="profile-section-title">Thư giới thiệu</h4>
          <p className="pre-line text-secondary">{application.coverLetter}</p>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
        <a href={fileUrl(application.resumeUrl)} target="_blank" rel="noreferrer" className="btn btn-primary">Xem CV đã nộp</a>
      </div>
    </Modal>
  );
}
