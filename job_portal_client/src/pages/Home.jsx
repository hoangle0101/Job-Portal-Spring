import { useEffect, useState } from 'react';
import { jobService, companyService } from '../services/jobPortalService';
import { CITY_OPTIONS } from '../utils/format';
import Icon from '../components/common/Icon';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import JobListItem from '../components/common/JobListItem';
import SelectMenu from '../components/common/SelectMenu';

export default function Home() {
  // Bộ lọc
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [industryId, setIndustryId] = useState('');
  const [jobTypeId, setJobTypeId] = useState('');

  // Danh mục cho bộ lọc
  const [industries, setIndustries] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    companyService.getIndustries().then((data) => setIndustries(data || [])).catch(() => { });
    companyService.getJobTypes().then((data) => setJobTypes(data || [])).catch(() => { });
  }, []);

  // Gọi API tìm kiếm; backend chỉ trả về các tin đang tuyển (OPEN)
  const fetchJobs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      setJobs((await jobService.getAllJobs({ keyword, city, industryId, jobTypeId })) || []);
    } catch (err) {
      setJobs([]);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tự tìm lại khi đổi thành phố / ngành / hình thức; từ khóa thì tìm khi bấm nút
  useEffect(() => {
    fetchJobs();
  }, [city, industryId, jobTypeId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setIndustryId('');
    setJobTypeId('');
  };

  return (
    <>
      {/* Khối tìm kiếm */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Tìm việc làm phù hợp với bạn</h1>
          <p className="hero-subtitle">Nộp CV trực tuyến, theo dõi lịch phỏng vấn và nhận Offer ngay trên hệ thống.</p>

          <form className="search-bar" onSubmit={handleSearch}>
            <label className="search-field">
              <Icon name="search" />
              <input
                type="text"
                placeholder="Vị trí, kỹ năng hoặc tên công ty"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </label>
            <label className="search-field search-field-city">
              <SelectMenu
                value={city}
                onChange={setCity}
                options={[{ value: '', label: 'Tất cả địa điểm' }, ...CITY_OPTIONS.map((c) => ({ value: c, label: c }))]}
                ariaLabel="Lọc việc làm theo địa điểm"
              />
            </label>
            <button type="submit" className="btn btn-primary btn-lg">Tìm việc</button>
          </form>
        </div>
      </section>

      <div className="page">
        <div className="container home-layout">
          {/* Bộ lọc bên trái */}
          <aside className="filter-panel">
            <div className="filter-panel-header">
              <h2>Bộ lọc</h2>
              {(industryId || jobTypeId) && <button type="button" className="btn-link text-small" onClick={clearFilters}>Xóa lọc</button>}
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Ngành nghề</h3>
              <label className="radio-option">
                <input type="radio" name="industry" checked={industryId === ''} onChange={() => setIndustryId('')} />
                Tất cả
              </label>
              {industries.map((ind) => (
                <label key={ind.id} className="radio-option">
                  <input type="radio" name="industry" checked={industryId === ind.id} onChange={() => setIndustryId(ind.id)} />
                  {ind.name}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Hình thức làm việc</h3>
              <label className="radio-option">
                <input type="radio" name="jobType" checked={jobTypeId === ''} onChange={() => setJobTypeId('')} />
                Tất cả
              </label>
              {jobTypes.map((type) => (
                <label key={type.id} className="radio-option">
                  <input type="radio" name="jobType" checked={jobTypeId === type.id} onChange={() => setJobTypeId(type.id)} />
                  {type.name}
                </label>
              ))}
            </div>
          </aside>

          {/* Danh sách việc làm */}
          <section>
            <div className="list-header">
              <h2 className="list-title">Việc làm đang tuyển</h2>
              {!loading && <span className="text-muted">{jobs.length} việc làm</span>}
            </div>

            <Alert message={errorMsg ? { type: 'error', text: errorMsg } : null} />

            {loading ? (
              <Loading text="Đang tải việc làm..." />
            ) : jobs.length === 0 ? (
              <EmptyState title="Không tìm thấy việc làm phù hợp" text="Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc." />
            ) : (
              <div className="job-list">
                {jobs.map((job) => <JobListItem key={job.id} job={job} />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
