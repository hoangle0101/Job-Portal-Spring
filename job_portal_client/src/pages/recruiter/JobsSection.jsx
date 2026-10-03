import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format';
import EmptyState from '../../components/common/EmptyState';

// Bảng tin tuyển dụng của nhà tuyển dụng
export default function JobsSection({ jobs, applications, onCreate, onEdit, onClose, onReopen }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="Bạn chưa đăng tin tuyển dụng nào"
        text="Đăng tin đầu tiên để bắt đầu nhận hồ sơ ứng viên."
        action={<button type="button" className="btn btn-primary" onClick={onCreate}>Đăng tin mới</button>}
      />
    );
  }

  const countApplications = (jobId) => applications.filter((a) => a.jobListingId === jobId).length;

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Vị trí</th>
            <th>Mức lương</th>
            <th>Hồ sơ</th>
            <th>Trạng thái</th>
            <th>Ngày đăng</th>
            <th className="col-actions">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <Link to={`/jobs/${job.id}`} className="cell-title cell-link">{job.title}</Link>
                <div className="text-small text-muted">{[job.companyName, job.jobTypeName].filter(Boolean).join(' · ')}</div>
              </td>
              <td className="text-secondary">{job.salaryRange || 'Thỏa thuận'}</td>
              <td>{countApplications(job.id)}</td>
              <td>
                <span className={`badge ${job.status === 'OPEN' ? 'badge-green' : 'badge-gray'}`}>
                  {job.status === 'OPEN' ? 'Đang tuyển' : 'Đã đóng'}
                </span>
              </td>
              <td className="text-secondary">{formatDate(job.createdAt)}</td>
              <td className="col-actions">
                <div className="table-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(job)}>Sửa</button>
                  {job.status === 'OPEN'
                    ? <button type="button" className="btn btn-danger btn-sm" onClick={() => onClose(job)}>Đóng tin</button>
                    : <button type="button" className="btn btn-secondary btn-sm" onClick={() => onReopen(job)}>Mở lại</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
