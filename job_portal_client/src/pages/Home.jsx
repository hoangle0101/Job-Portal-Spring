import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  LoaderCircle,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { jobService, companyService } from '../services/jobPortalService';

const FALLBACK_MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Java Spring Boot Engineer',
    companyName: 'FPT Software',
    city: 'Hà Nội',
    salaryRange: '25,000,000 - 40,000,000 VNĐ',
    jobTypeName: 'Full-time',
    industryName: 'Công nghệ thông tin',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
    tags: ['Java 17', 'Spring Boot', 'MySQL', 'Microservices']
  },
  {
    id: 2,
    title: 'React Frontend Developer',
    companyName: 'VNG Corporation',
    city: 'Hồ Chí Minh',
    salaryRange: '18,000,000 - 30,000,000 VNĐ',
    jobTypeName: 'Hybrid',
    industryName: 'Game & Internet',
    companyLogo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&h=100&fit=crop',
    tags: ['React', 'JavaScript', 'Vite', 'REST API']
  },
  {
    id: 3,
    title: 'Fullstack Developer (Spring & React)',
    companyName: 'Viettel Telecom',
    city: 'Đà Nẵng',
    salaryRange: '22,000,000 - 35,000,000 VNĐ',
    jobTypeName: 'Full-time',
    industryName: 'Viễn thông',
    companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop',
    tags: ['Java', 'Spring Data JPA', 'React', 'Docker']
  }
];

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('All');
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [industries, setIndustries] = useState([]);
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLiveFromDb, setIsLiveFromDb] = useState(false);

  const cityMenuRef = useRef(null);
  const cityOptions = [
    { value: 'All', label: 'Toàn quốc' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  ];

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (cityMenuRef.current && !cityMenuRef.current.contains(event.target)) {
        setIsCityMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsCityMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Tải danh mục ngành nghề từ Backend
  useEffect(() => {
    companyService.getIndustries()
      .then((data) => {
        if (Array.isArray(data)) setIndustries(data);
      })
      .catch(() => {});
  }, []);

  // Tải danh sách công việc từ Spring Boot Backend
  const fetchJobs = async (searchKw = keyword, searchCity = city) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await jobService.getAllJobs({
        keyword: searchKw,
        city: searchCity
      });

      if (Array.isArray(data) && data.length > 0) {
        setJobs(data);
        setIsLiveFromDb(true);
      } else {
        // Fallback về mock data nếu database chưa có tin đăng nào
        setJobs(FALLBACK_MOCK_JOBS);
        setIsLiveFromDb(false);
      }
    } catch (err) {
      console.warn('Backend job search fallback:', err.message);
      setJobs(FALLBACK_MOCK_JOBS);
      setIsLiveFromDb(false);
      setErrorMsg('Không thể kết nối máy chủ dữ liệu thực, đang hiển thị danh sách việc làm mẫu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [city]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(keyword, city);
  };

  // Lọc theo Industry Chip nếu có chọn
  const displayedJobs = jobs.filter(j => {
    if (selectedIndustry === 'ALL') return true;
    const indName = j.industryName || '';
    return indName.toLowerCase().includes(selectedIndustry.toLowerCase());
  });

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.08) 0%, rgba(248, 250, 252, 0) 100%)', padding: '64px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
            <Sparkles size={16} /> Nền tảng kết nối Tuyển dụng & Ứng viên Chuẩn Quốc tế
          </div>

          <h1 style={{ fontSize: '44px', fontWeight: '800', lineHeight: 1.2, letterSpacing: '-1px', maxWidth: '800px', margin: '0 auto 16px' }}>
            Khám phá hơn <span style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>10,000+ Cơ hội việc làm</span> hấp dẫn
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '640px', margin: '0 auto 36px', lineHeight: '1.6' }}>
            Kết nối trực tiếp giữa ứng viên tài năng và nhà tuyển dụng hàng đầu qua quy trình nộp hồ sơ, phỏng vấn và Offer thông minh.
          </p>

          {/* Search Box Card */}
          <form onSubmit={handleSearchSubmit} className="card" style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', gap: '12px', padding: '10px 14px', alignItems: 'center', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 2, padding: '0 12px' }}>
              <Search size={20} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Vị trí công việc, kỹ năng (Java, React, Spring Boot...)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px' }}
              />
            </div>
            
            <div style={{ height: '32px', width: '1px', background: 'var(--border)' }}></div>

            <div ref={cityMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, padding: '0 12px' }}>
              <MapPin size={20} color="var(--text-muted)" />
              <button
                type="button"
                onClick={() => setIsCityMenuOpen((current) => !current)}
                aria-expanded={isCityMenuOpen}
                aria-haspopup="listbox"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: 0, background: 'transparent', color: 'var(--text-primary)', fontSize: '15px', cursor: 'pointer', padding: '8px 0', textAlign: 'left' }}
              >
                <span>{cityOptions.find((option) => option.value === city)?.label}</span>
                <ChevronDown size={17} style={{ color: 'var(--text-muted)', transform: isCityMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {isCityMenuOpen && (
                <div role="listbox" aria-label="Chọn khu vực" style={{ position: 'absolute', top: 'calc(100% + 10px)', left: '8px', right: '8px', padding: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 20 }}>
                  {cityOptions.map((option) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={city === option.value}
                      key={option.value}
                      onClick={() => {
                        setCity(option.value);
                        setIsCityMenuOpen(false);
                      }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 11px', border: 0, borderRadius: '8px', background: city === option.value ? 'var(--primary-light)' : 'transparent', color: city === option.value ? 'var(--primary)' : 'var(--text-primary)', fontSize: '14px', fontWeight: city === option.value ? '700' : '500', cursor: 'pointer', textAlign: 'left' }}
                    >
                      {option.label}
                      {city === option.value && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              {loading ? <LoaderCircle size={18} className="spin" /> : 'Tìm kiếm'}
            </button>
          </form>

          {/* Industry Filter Chips */}
          {industries.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setSelectedIndustry('ALL')}
                style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--border)', background: selectedIndustry === 'ALL' ? 'var(--primary)' : 'var(--bg-surface)', color: selectedIndustry === 'ALL' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Tất cả ngành nghề
              </button>
              {industries.slice(0, 5).map(ind => (
                <button
                  type="button"
                  key={ind.id}
                  onClick={() => setSelectedIndustry(ind.name)}
                  style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--border)', background: selectedIndustry === ind.name ? 'var(--primary)' : 'var(--bg-surface)', color: selectedIndustry === ind.name ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {ind.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="container" style={{ marginTop: '40px', paddingBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Việc làm nổi bật</h2>
              {isLiveFromDb && (
                <span className="badge badge-primary" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={12} /> Dữ liệu trực tiếp từ Database
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Cơ hội việc làm được cập nhật trực tiếp từ các nhà tuyển dụng hàng đầu
            </p>
          </div>
          <span className="badge badge-neutral">{displayedJobs.length} việc làm phù hợp</span>
        </div>

        {errorMsg && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <LoaderCircle size={32} className="spin" style={{ margin: '0 auto 12px' }} />
            <p>Đang tìm kiếm việc làm từ máy chủ...</p>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
            <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Không tìm thấy việc làm phù hợp</h3>
            <p style={{ fontSize: '14px', marginTop: '6px' }}>Hãy thử thay đổi từ khóa hoặc bộ lọc khu vực.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {displayedJobs.map((job) => {
              const compName = job.companyName || 'Doanh nghiệp tuyển dụng';
              const initial = compName.trim().charAt(0).toUpperCase();

              return (
                <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={compName}
                          style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: '#fff', fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {initial}
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                          <Building2 size={15} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{compName}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <span className="badge badge-primary"><DollarSign size={12} /> {job.salaryRange || 'Thỏa thuận'}</span>
                      {job.city && <span className="badge badge-neutral"><MapPin size={12} /> {job.city}</span>}
                      {job.jobTypeName && <span className="badge badge-neutral"><Briefcase size={12} /> {job.jobTypeName}</span>}
                      {job.industryName && <span className="badge badge-neutral">{job.industryName}</span>}
                    </div>

                    {job.tags && Array.isArray(job.tags) && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {job.tags.map(t => (
                          <span key={t} style={{ fontSize: '12px', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Mã tin: #{job.id}
                    </span>
                    <Link to={`/jobs/${job.id}`} className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px' }}>
                      Xem chi tiết <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
