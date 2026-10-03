import { useState } from 'react';
import { APPLICATION_STATUS, fileUrl, formatDate, formatDateTime } from '../../utils/format';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';

// Trạng thái còn được phép "Từ chối" (trước khi gửi Offer)
const REJECTABLE_STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_PASSED'];

// Bảng hồ sơ ứng tuyển. onAction(type, application): mở hộp thoại tương ứng ở trang cha
export default function ApplicantsSection({ applications, jobs, onAction }) {
  const [filterJobId, setFilterJobId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filtered = applications.filter((a) =>
    (filterJobId === 'ALL' || String(a.jobListingId) === filterJobId) &&
    (filterStatus === 'ALL' || a.status === filterStatus));

  // Nút bước tiếp theo, theo đúng thứ tự quy trình tuyển dụng
  const renderNextStep = (a) => {
    if (a.status === 'APPLIED') {
      return <button type="button" className="btn btn-primary btn-sm" onClick={() => onAction('SHORTLIST', a)}>Shortlist</button>;
    }
    if (a.status === 'SHORTLISTED') {
      return <button type="button" className="btn btn-primary btn-sm" onClick={() => onAction('INTERVIEW', a)}>Hẹn PV</button>;
    }
    if (a.status === 'INTERVIEW_SCHEDULED') {
      // Chỉ chấm điểm được sau khi buổi phỏng vấn đã bắt đầu
      const started = a.interview && new Date(a.interview.startTime) <= new Date();
      return (
        <button type="button" className="btn btn-primary btn-sm" disabled={!started} onClick={() => onAction('FEEDBACK', a)}
          title={started ? '' : `Chấm điểm sau khi buổi phỏng vấn bắt đầu (${formatDateTime(a.interview?.startTime)})`}>
          Chấm PV
        </button>
      );
    }
    if (a.status === 'INTERVIEW_PASSED') {
      return <button type="button" className="btn btn-primary btn-sm" onClick={() => onAction('OFFER', a)}>Gửi Offer</button>;
    }
    if (a.status === 'OFFERED') {
      return <span className="text-small text-muted">Chờ ứng viên phản hồi</span>;
    }
    return null;
  };

  return (
    <>
      <div className="toolbar">
        <select className="form-input" value={filterJobId} onChange={(e) => setFilterJobId(e.target.value)}>
          <option value="ALL">Tất cả tin tuyển dụng</option>
          {jobs.map((j) => <option key={j.id} value={String(j.id)}>{j.title}</option>)}
        </select>
        <select className="form-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(APPLICATION_STATUS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
        </select>
        <span className="toolbar-end text-small text-muted">{filtered.length} hồ sơ</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Chưa có hồ sơ nào" text="Hồ sơ ứng viên nộp vào tin của bạn sẽ hiện ở đây." />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Ứng viên</th>
                <th>Vị trí ứng tuyển</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="cell-title">{a.candidateName}</div>
                    <div className="text-small text-muted">{a.candidateEmail}</div>
                    {a.candidatePhone && <div className="text-small text-muted">{a.candidatePhone}</div>}
                  </td>
                  <td>
                    <div>{a.jobTitle}</div>
                    <a href={fileUrl(a.resumeUrl)} target="_blank" rel="noreferrer" className="text-link text-small">Xem CV</a>
                  </td>
                  <td className="text-secondary">{formatDate(a.createdAt)}</td>
                  <td>
                    <StatusBadge status={a.status} />
                    {a.status === 'INTERVIEW_SCHEDULED' && a.interview && (
                      <div className="text-small text-muted">{formatDateTime(a.interview.startTime)}</div>
                    )}
                  </td>
                  <td className="col-actions">
                    <div className="table-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onAction('PROFILE', a)}>Hồ sơ</button>
                      {renderNextStep(a)}
                      {REJECTABLE_STATUSES.includes(a.status) && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => onAction('REJECT', a)}>Từ chối</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
