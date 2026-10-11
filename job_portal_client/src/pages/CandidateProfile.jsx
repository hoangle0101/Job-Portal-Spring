import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    AlertCircle,
    Award,
    Building2,
    Calendar,
    CheckCircle2,
    Download,
    FileText,
    LoaderCircle,
    Save,
    Upload,
    XCircle,
} from 'lucide-react';
import {
    applicationService,
    candidateService,
    hiringService,
    jobService,
} from '../services/jobPortalService';

const emptyProfile = { bio: '', skills: '', education: '', experience: '', resumeUrl: '' };

const statusLabels = {
    APPLIED: 'Đang chờ duyệt',
    SHORTLISTED: 'Đã vào danh sách rút gọn',
    INTERVIEW_SCHEDULED: 'Đã lên lịch phỏng vấn',
    OFFERED: 'Đã nhận Offer',
    ACCEPTED: 'Đã chấp nhận Offer',
    DECLINED: 'Đã từ chối Offer',
    REJECTED: 'Không phù hợp',
};

const statusClasses = {
    APPLIED: 'badge-neutral',
    SHORTLISTED: 'badge-primary',
    INTERVIEW_SCHEDULED: 'badge-primary',
    OFFERED: 'badge-success',
    ACCEPTED: 'badge-success',
    DECLINED: 'badge-neutral',
    REJECTED: 'badge-danger',
};

const formatDate = (value) => {
    if (!value) return 'Chưa cập nhật';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value));
};

const formatDateTime = (value) => {
    if (!value) return 'Chưa cập nhật';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

const formatSalary = (value) => {
    if (value === null || value === undefined) return 'Chưa cập nhật';
    return `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ/tháng`;
};

const resolveFileUrl = (url) => (url?.startsWith('http') ? url : `http://localhost:8080${url || ''}`);

export default function CandidateProfile() {
    const { user } = useAuth();
    const userId = user?.id;
    const [profile, setProfile] = useState(emptyProfile);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [respondingOfferId, setRespondingOfferId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return undefined;
        }

        let active = true;
        const loadPage = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const [profileResult, applicationsResult] = await Promise.all([
                    candidateService.getProfile(userId).catch(() => null),
                    applicationService.getMyApplications(userId),
                ]);
                const enrichedApplications = await Promise.all((applicationsResult || []).map(async (application) => {
                    try {
                        const job = await jobService.getJobById(application.jobListingId);
                        return { ...application, job };
                    } catch {
                        return application;
                    }
                }));

                if (active) {
                    setProfile(profileResult ? { ...emptyProfile, ...profileResult } : emptyProfile);
                    setApplications(enrichedApplications);
                }
            } catch (error) {
                if (active) setLoadError(error.message || 'Không thể tải dữ liệu hồ sơ.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadPage();
        return () => { active = false; };
    }, [userId]);

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfile((current) => ({ ...current, [name]: value }));
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const saved = await candidateService.saveProfile({
                userId,
                bio: profile.bio,
                skills: profile.skills,
                education: profile.education,
                experience: profile.experience,
                avatarUrl: profile.avatarUrl || null,
            });
            setProfile((current) => ({ ...current, ...saved }));
            setMessage({ type: 'success', text: 'Đã lưu hồ sơ cá nhân.' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Không thể lưu hồ sơ.' });
        } finally {
            setSaving(false);
        }
    };

    const handleUploadCv = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (!['.pdf', '.docx'].includes(extension)) {
            setMessage({ type: 'error', text: 'CV chỉ được chấp nhận định dạng PDF hoặc DOCX.' });
            event.target.value = '';
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });
        try {
            const result = await candidateService.uploadCv(userId, file);
            setProfile((current) => ({ ...current, ...result }));
            setMessage({ type: 'success', text: 'Đã cập nhật CV mặc định.' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Không thể upload CV.' });
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleRespondOffer = async (application, status) => {
        const offer = application.offer;
        if (!offer?.id) {
            setMessage({ type: 'error', text: 'Offer chưa có mã để phản hồi. Backend cần trả về thông tin offer.' });
            return;
        }

        setRespondingOfferId(offer.id);
        setMessage({ type: '', text: '' });
        try {
            await hiringService.respondOffer(offer.id, { candidateId: userId, status });
            setApplications((current) => current.map((item) => (
                item.id === application.id
                    ? { ...item, status: status === 'ACCEPTED' ? 'ACCEPTED' : 'DECLINED', offer: { ...offer, status } }
                    : item
            )));
            setMessage({ type: 'success', text: status === 'ACCEPTED' ? 'Bạn đã chấp nhận Offer.' : 'Bạn đã từ chối Offer.' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Không thể phản hồi Offer.' });
        } finally {
            setRespondingOfferId(null);
        }
    };

    if (!userId) {
        return (
            <div className="container" style={{ padding: '72px 24px', textAlign: 'center' }}>
                <FileText size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>Đăng nhập để xem hồ sơ</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Bạn cần tài khoản ứng viên để quản lý hồ sơ và đơn ứng tuyển.</p>
                <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container" style={{ padding: '72px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <LoaderCircle size={28} style={{ margin: '0 auto 12px' }} />
                <p>Đang tải hồ sơ và đơn ứng tuyển...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Hồ sơ & Đơn ứng tuyển của tôi</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Cập nhật hồ sơ, theo dõi tiến trình và phản hồi từ nhà tuyển dụng.</p>
            </div>

            {loadError && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px' }}><AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />{loadError}</div>}
            {message.text && (
                <div style={{ background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#b91c1c', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px' }}>
                    {message.type === 'success' ? <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> : <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />}
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 2fr)', gap: '32px', alignItems: 'start' }}>
                <form className="card" onSubmit={handleSaveProfile}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: '700' }}>
                            {(user.fullName || user.email || 'N')[0].toUpperCase()}
                        </div>
                        <div><h2 style={{ fontSize: '18px', fontWeight: '700' }}>{user.fullName || 'Ứng viên'}</h2><p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user.email}</p></div>
                    </div>

                    {[
                        ['bio', 'Giới thiệu bản thân', 'Chia sẻ ngắn gọn về định hướng và điểm mạnh của bạn.'],
                        ['skills', 'Kỹ năng', 'Java, Spring Boot, React...'],
                        ['education', 'Học vấn', 'Trường, chuyên ngành, thời gian học...'],
                        ['experience', 'Kinh nghiệm', 'Kinh nghiệm làm việc hoặc dự án nổi bật...'],
                    ].map(([name, label, placeholder]) => (
                        <label key={name} style={{ display: 'block', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>
                            {label}
                            <textarea name={name} value={profile[name] || ''} onChange={handleProfileChange} placeholder={placeholder} rows={name === 'bio' ? 3 : 2} style={{ display: 'block', width: '100%', marginTop: '6px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', resize: 'vertical', fontSize: '14px' }} />
                        </label>
                    ))}

                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%' }}>{saving ? <LoaderCircle size={16} /> : <Save size={16} />} {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>

                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>CV mặc định</h3>
                        {profile.resumeUrl ? <a href={resolveFileUrl(profile.resumeUrl)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '13px', marginBottom: '12px' }}><FileText size={16} /> Xem CV hiện tại <Download size={14} /></a> : <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>Bạn chưa có CV mặc định.</p>}
                        <label className="btn btn-outline" style={{ width: '100%', cursor: uploading ? 'wait' : 'pointer' }}>{uploading ? <LoaderCircle size={16} /> : <Upload size={16} />} {uploading ? 'Đang upload...' : 'Upload CV (.pdf, .docx)'}<input type="file" accept=".pdf,.docx" onChange={handleUploadCv} disabled={uploading} style={{ display: 'none' }} /></label>
                    </div>
                </form>

                <section>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Tiến trình ứng tuyển ({applications.length})</h2>
                    {applications.length === 0 ? <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}><FileText size={30} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} /><p>Bạn chưa nộp hồ sơ cho công việc nào.</p><Link to="/" className="btn btn-outline" style={{ marginTop: '14px' }}>Tìm việc làm</Link></div> : applications.map((application) => {
                        const status = application.status || 'APPLIED';
                        const interview = application.interview || application.interviewSlot;
                        const offer = application.offer;
                        const job = application.job;
                        return (
                            <article key={application.id} className="card" style={{ marginBottom: '16px', borderLeft: `4px solid ${status === 'OFFERED' ? 'var(--success)' : status === 'INTERVIEW_SCHEDULED' ? 'var(--primary)' : 'var(--border)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div><h3 style={{ fontSize: '17px', fontWeight: '700' }}>{job?.title || `Mã tin tuyển dụng #${application.jobListingId}`}</h3><div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '5px' }}><Building2 size={15} /> {job?.companyName || 'Thông tin công ty đang cập nhật'} · Nộp {formatDate(application.createdAt)}</div></div>
                                    <span className={`badge ${statusClasses[status] || 'badge-neutral'}`}>{statusLabels[status] || status}</span>
                                </div>

                                {status === 'INTERVIEW_SCHEDULED' && interview && <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '14px', marginTop: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3730a3', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}><Calendar size={18} /> Lịch phỏng vấn: {formatDateTime(interview.startTime)}</div>{interview.meetingLink && <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '12px' }}>Tham gia phỏng vấn</a>}</div>}

                                {status === 'OFFERED' && offer && <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '16px', marginTop: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: '700', marginBottom: '6px' }}><Award size={18} /> Chúc mừng! Bạn đã nhận được Offer</div><p style={{ fontSize: '14px', color: '#047857', marginBottom: '12px' }}>Mức lương đề xuất: <strong>{formatSalary(offer.salary)}</strong></p><div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}><button type="button" onClick={() => handleRespondOffer(application, 'ACCEPTED')} disabled={respondingOfferId === offer.id} className="btn btn-primary" style={{ background: 'var(--success)', padding: '8px 16px', fontSize: '13px' }}><CheckCircle2 size={15} /> Chấp nhận Offer</button><button type="button" onClick={() => handleRespondOffer(application, 'DECLINED')} disabled={respondingOfferId === offer.id} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '13px' }}><XCircle size={15} /> Từ chối</button></div></div>}
                            </article>
                        );
                    })}
                </section>
            </div>
        </div>
    );
}