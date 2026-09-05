import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign, ArrowRight, Building2, Star } from 'lucide-react';

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Java Spring Boot Engineer',
    company: 'FPT Software',
    city: 'Hà Nội',
    salary: '25,000,000 - 40,000,000 VNĐ',
    jobType: 'Full-time',
    industry: 'Công nghệ thông tin',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
    tags: ['Java 17', 'Spring Boot', 'MySQL', 'Microservices']
  },
  {
    id: 2,
    title: 'React Frontend Developer',
    company: 'VNG Corporation',
    city: 'Hồ Chí Minh',
    salary: '18,000,000 - 30,000,000 VNĐ',
    jobType: 'Hybrid',
    industry: 'Game & Internet',
    logo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&h=100&fit=crop',
    tags: ['React', 'JavaScript', 'Vite', 'REST API']
  },
  {
    id: 3,
    title: 'Fullstack Developer (Spring & React)',
    company: 'Viettel Telecom',
    city: 'Đà Nẵng',
    salary: '22,000,000 - 35,000,000 VNĐ',
    jobType: 'Full-time',
    industry: 'Viễn thông',
    logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop',
    tags: ['Java', 'Spring Data JPA', 'React', 'Docker']
  }
];

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('All');

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchKeyword = job.title.toLowerCase().includes(keyword.toLowerCase()) || job.company.toLowerCase().includes(keyword.toLowerCase());
    const matchCity = city === 'All' || job.city === city;
    return matchKeyword && matchCity;
  });

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.06) 0%, rgba(248, 250, 252, 0) 100%)', padding: '64px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="badge badge-primary" style={{ marginBottom: '16px', padding: '6px 14px', fontSize: '13px' }}>
            🚀 Nền tảng tuyển dụng công nghệ thế hệ mới
          </span>
          <h1 style={{ fontSize: '44px', fontWeight: '800', lineHeight: 1.2, letterSpacing: '-1px', maxWidth: '800px', margin: '0 auto 16px' }}>
            Khám phá hơn <span style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>10,000+ Cơ hội việc làm</span> hấp dẫn
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 36px' }}>
            Kết nối trực tiếp giữa ứng viên chất lượng và nhà tuyển dụng hàng đầu qua hệ thống phỏng vấn thông minh.
          </p>

          {/* Search Box Card */}
          <div className="card" style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', gap: '12px', padding: '12px', alignItems: 'center', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 2, padding: '0 12px' }}>
              <Search size={20} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Vị trí công việc, kỹ năng (Java, React, Tester...)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px' }}
              />
            </div>
            
            <div style={{ height: '32px', width: '1px', background: 'var(--border)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, padding: '0 12px' }}>
              <MapPin size={20} color="var(--text-muted)" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', background: 'transparent' }}
              >
                <option value="All">Toàn quốc</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>

            <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="container" style={{ marginTop: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Việc làm nổi bật</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Cơ hội việc làm được cập nhật trực tiếp từ các nhà tuyển dụng uy tín</p>
          </div>
          <span className="badge badge-neutral">{filteredJobs.length} việc làm phù hợp</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredJobs.map((job) => (
            <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <img src={job.logo} alt={job.company} style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>{job.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <Building2 size={15} /> <span>{job.company}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span className="badge badge-primary"><DollarSign size={12} /> {job.salary}</span>
                  <span className="badge badge-neutral"><MapPin size={12} /> {job.city}</span>
                  <span className="badge badge-neutral"><Briefcase size={12} /> {job.jobType}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {job.tags.map(t => <span key={t} style={{ fontSize: '12px', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>{t}</span>)}
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vừa đăng 1 giờ trước</span>
                <Link to={`/jobs/${job.id}`} className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px' }}>
                  Xem chi tiết <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
