import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import CompanyLogo from '../../components/common/CompanyLogo';

// Danh sách công ty do nhà tuyển dụng quản lý
export default function CompaniesSection({ companies, onCreate, onEdit, onDelete }) {
  if (companies.length === 0) {
    return (
      <EmptyState
        title="Bạn chưa có trang công ty"
        text="Tạo trang công ty trước khi đăng tin tuyển dụng."
        action={<button type="button" className="btn btn-primary" onClick={onCreate}>Tạo công ty</button>}
      />
    );
  }

  return (
    <div className="managed-company-list">
      {companies.map((c) => (
        <article key={c.id} className="card managed-company">
          <CompanyLogo name={c.name} logoUrl={c.logoUrl} size={64} />
          <div className="managed-company-body">
            <Link to={`/companies/${c.id}`} className="managed-company-name">{c.name}</Link>
            <p className="text-small text-muted">
              {c.reviewCount > 0 ? `${c.averageRating}/5 · ${c.reviewCount} đánh giá` : 'Chưa có đánh giá'}
              {c.website && ` · ${c.website}`}
            </p>
            <ul className="managed-company-locations">
              {c.locations.map((l) => <li key={l.id}>{l.address}, {l.city}</li>)}
            </ul>
          </div>
          <div className="table-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(c)}>Sửa</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(c)}>Xóa</button>
          </div>
        </article>
      ))}
    </div>
  );
}
