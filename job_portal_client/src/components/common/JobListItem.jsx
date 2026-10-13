import { Link } from 'react-router-dom';
import CompanyLogo from './CompanyLogo';
import { formatRelativeDate } from '../../utils/format';

// Một dòng việc làm trong danh sách (trang chủ, trang công ty). showCompany = false khi đang ở trang của chính công ty đó
export default function JobListItem({ job, showCompany = true }) {
  return (
    <article className="job-item">
      {showCompany && <CompanyLogo name={job.companyName} logoUrl={job.companyLogo} size={60} />}

      <div className="job-item-body">
        <Link to={`/jobs/${job.id}`} className="job-item-title">{job.title}</Link>
        {showCompany && (
          <Link to={`/companies/${job.companyId}`} className="job-item-company">{job.companyName}</Link>
        )}
        <div className="job-item-meta">
          <span className="job-salary">{job.salaryRange || 'Thỏa thuận'}</span>
          {job.city && <span>{job.city}</span>}
          {job.jobTypeName && <span>{job.jobTypeName}</span>}
        </div>
      </div>

      <div className="job-item-side">
        {job.industryName && <span className="tag">{job.industryName}</span>}
        <span className="text-small text-muted">{formatRelativeDate(job.createdAt)}</span>
      </div>
    </article>
  );
}
