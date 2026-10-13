import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { companyService, reviewService } from '../services/jobPortalService';
import { formatDate } from '../utils/format';
import Icon from '../components/common/Icon';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import CompanyLogo from '../components/common/CompanyLogo';
import Avatar from '../components/common/Avatar';
import StarRating from '../components/common/StarRating';
import JobListItem from '../components/common/JobListItem';

export default function CompanyDetail() {
  const { id } = useParams();
  const { user, isSeeker, isAdmin } = useAuth();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Form đánh giá (dùng cho cả viết mới và sửa)
  const [editingId, setEditingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [companyData, jobsData, reviewsData] = await Promise.all([
        companyService.getCompanyById(id),
        companyService.getCompanyJobs(id),
        reviewService.getCompanyReviews(id),
      ]);
      setCompany(companyData);
      setJobs(jobsData || []);
      setReviews(reviewsData || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const myReview = user ? reviews.find((r) => r.userId === user.id) : null;

  const startEdit = (review) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const resetForm = () => {
    setEditingId(null);
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    setReviewMsg(null);
    try {
      if (editingId) {
        await reviewService.updateReview(id, editingId, { rating, comment });
        setReviewMsg({ type: 'success', text: 'Đã cập nhật đánh giá.' });
      } else {
        await reviewService.createReview(id, { rating, comment });
        setReviewMsg({ type: 'success', text: 'Cảm ơn bạn đã đánh giá!' });
      }
      resetForm();
      await loadData(); // tải lại để cập nhật điểm trung bình
    } catch (err) {
      setReviewMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await reviewService.deleteReview(id, reviewId);
      resetForm();
      setReviewMsg({ type: 'success', text: 'Đã xóa đánh giá.' });
      await loadData();
    } catch (err) {
      setReviewMsg({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return <Loading />;
  }
  if (!company) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Không tìm thấy công ty"
            text={errorMsg}
            action={<Link to="/companies" className="btn btn-secondary">Danh sách công ty</Link>}
          />
        </div>
      </div>
    );
  }

  // Ứng viên được viết 1 đánh giá; khi đã có thì chỉ hiện form khi bấm "Sửa"
  const showReviewForm = isSeeker && (!myReview || editingId);

  return (
    <>
      <div className="company-banner" />

      <div className="container company-page">
        {/* Thông tin chính */}
        <section className="card company-profile">
          <CompanyLogo name={company.name} logoUrl={company.logoUrl} size={104} />
          <div className="company-profile-info">
            <h1 className="company-profile-name">{company.name}</h1>
            <div className="company-profile-meta">
              <span className="rating-summary">
                <StarRating value={Math.round(company.averageRating)} />
                {company.reviewCount > 0 ? `${company.averageRating}/5 · ${company.reviewCount} đánh giá` : 'Chưa có đánh giá'}
              </span>
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="text-link">{company.website}</a>
              )}
            </div>
          </div>
        </section>

        <div className="two-column">
          <div>
            <section className="card">
              <h2 className="card-title">Giới thiệu công ty</h2>
              <p className="pre-line text-secondary">{company.description || 'Công ty chưa cập nhật phần giới thiệu.'}</p>
            </section>

            <section className="card">
              <h2 className="card-title">Việc làm đang tuyển ({jobs.length})</h2>
              {jobs.length === 0 ? (
                <p className="text-muted">Công ty hiện chưa có tin tuyển dụng nào.</p>
              ) : (
                <div className="job-list job-list-plain">
                  {jobs.map((job) => <JobListItem key={job.id} job={job} showCompany={false} />)}
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="card-title">Đánh giá từ ứng viên ({reviews.length})</h2>
              <Alert message={reviewMsg} onClose={() => setReviewMsg(null)} />

              {!user && (
                <p className="text-secondary review-login-hint">
                  <Link to="/login" className="text-link">Đăng nhập</Link> bằng tài khoản ứng viên để viết đánh giá.
                </p>
              )}

              {showReviewForm && (
                <form className="review-form" onSubmit={handleSubmitReview}>
                  <h3 className="review-form-title">{editingId ? 'Sửa đánh giá của bạn' : 'Viết đánh giá'}</h3>
                  <div className="form-group">
                    <StarRating value={rating} onChange={setRating} size={24} />
                  </div>
                  <div className="form-group">
                    <textarea className="form-input" rows={3} required placeholder="Chia sẻ trải nghiệm của bạn về môi trường làm việc, quy trình phỏng vấn..."
                      value={comment} onChange={(e) => setComment(e.target.value)} />
                  </div>
                  <div className="form-actions">
                    {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Hủy</button>}
                    <button type="submit" disabled={saving} className="btn btn-primary">
                      {saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Gửi đánh giá'}
                    </button>
                  </div>
                </form>
              )}

              {reviews.length === 0 && <p className="text-muted">Chưa có đánh giá nào.</p>}
              {reviews.map((review) => {
                const isMine = user && review.userId === user.id;
                return (
                  <article key={review.id} className="review">
                    <Avatar name={review.userName} avatarUrl={review.userAvatar} size={40} />
                    <div className="review-body">
                      <div className="review-header">
                        <strong>{review.userName}{isMine && ' (bạn)'}</strong>
                        <span className="text-small text-muted">{formatDate(review.createdAt)}</span>
                      </div>
                      <StarRating value={review.rating} size={14} />
                      <p className="review-comment pre-line">{review.comment}</p>
                      {(isMine || isAdmin) && (
                        <div className="review-actions">
                          {isMine && <button type="button" className="btn-link" onClick={() => startEdit(review)}>Sửa</button>}
                          <button type="button" className="btn-link link-danger" onClick={() => handleDeleteReview(review.id)}>Xóa</button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          </div>

          <aside className="sidebar-sticky">
            <section className="card">
              <h2 className="card-title">Địa chỉ</h2>
              <ul className="location-list">
                {company.locations.map((loc) => (
                  <li key={loc.id}>
                    <Icon name="location" size={16} />
                    <span><strong>{loc.city}</strong><br />{loc.address}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
