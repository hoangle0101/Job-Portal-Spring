import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyService } from '../services/jobPortalService';
import { CITY_OPTIONS } from '../utils/format';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import CompanyLogo from '../components/common/CompanyLogo';
import StarRating from '../components/common/StarRating';
import SelectMenu from '../components/common/SelectMenu';

export default function Companies() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCompanies = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      setCompanies((await companyService.getAllCompanies(keyword, city)) || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [city]);

  const handleSubmit = (e) => {
    e.preventDefault();
    loadCompanies();
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Danh sách công ty</h1>
            <p className="page-subtitle">Tìm hiểu doanh nghiệp, xem đánh giá và việc làm đang tuyển.</p>
          </div>
        </div>

        <form className="toolbar" onSubmit={handleSubmit}>
          <input className="form-input toolbar-search" placeholder="Nhập tên công ty" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <SelectMenu
            value={city}
            onChange={setCity}
            options={[{ value: '', label: 'Tất cả địa điểm' }, ...CITY_OPTIONS.map((c) => ({ value: c, label: c }))]}
            ariaLabel="Lọc công ty theo địa điểm"
          />
          <button type="submit" className="btn btn-primary">Tìm kiếm</button>
        </form>

        <Alert message={errorMsg ? { type: 'error', text: errorMsg } : null} />

        {loading ? (
          <Loading />
        ) : companies.length === 0 ? (
          <EmptyState title="Không tìm thấy công ty phù hợp" text="Hãy thử tên khác hoặc chọn địa điểm khác." />
        ) : (
          <div className="company-grid">
            {companies.map((c) => (
              <Link key={c.id} to={`/companies/${c.id}`} className="company-card">
                <div className="company-card-top">
                  <CompanyLogo name={c.name} logoUrl={c.logoUrl} size={56} />
                  <div>
                    <h2 className="company-card-name">{c.name}</h2>
                    <span className="rating-summary">
                      <StarRating value={Math.round(c.averageRating)} size={14} />
                      {c.reviewCount > 0 ? `${c.averageRating} (${c.reviewCount})` : 'Chưa có đánh giá'}
                    </span>
                  </div>
                </div>
                <p className="company-card-description">{c.description || 'Chưa có mô tả.'}</p>
                <p className="company-card-cities">{c.locations.map((l) => l.city).join(' · ')}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
