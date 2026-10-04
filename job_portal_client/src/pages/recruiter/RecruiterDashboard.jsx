import { useEffect, useState } from 'react';
import {
  applicationService, candidateService, companyService, hiringService, jobService,
} from '../../services/jobPortalService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import ApplicantsSection from './ApplicantsSection';
import JobsSection from './JobsSection';
import CompaniesSection from './CompaniesSection';
import JobFormModal from './JobFormModal';
import CompanyFormModal from './CompanyFormModal';
import HiringActionModal from './HiringActionModal';
import CandidateProfileModal from './CandidateProfileModal';
import { jobToForm, toJobPayload } from './recruiterForms';

const SECTION_TITLES = {
  applicants: 'Hồ sơ ứng tuyển',
  jobs: 'Tin tuyển dụng',
  companies: 'Công ty của tôi',
};

/*
 * Trang quản lý của Nhà tuyển dụng.
 * File này giữ dữ liệu + gọi API; phần hiển thị nằm ở các *Section, form nằm ở các *Modal.
 */
export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('applicants');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Dữ liệu
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);

  // Hộp thoại đang mở (null = không mở), ví dụ:
  // { kind: 'JOB', job } | { kind: 'COMPANY', company } | { kind: 'HIRING', type, application } | { kind: 'PROFILE', application, profile }
  const [modal, setModal] = useState(null);
  const [modalError, setModalError] = useState('');

  // Tải toàn bộ dữ liệu của nhà tuyển dụng (mỗi loại 1 request)
  const loadData = async () => {
    try {
      const [companyData, jobData, appData, industryData, typeData] = await Promise.all([
        companyService.getMyCompanies(),
        jobService.getMyJobs(),
        applicationService.getRecruiterApplications(),
        companyService.getIndustries(),
        companyService.getJobTypes(),
      ]);
      setCompanies(companyData || []);
      setJobs(jobData || []);
      setApplications(appData || []);
      setIndustries(industryData || []);
      setJobTypes(typeData || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (value) => {
    setModalError('');
    setModal(value);
  };

  const closeModal = () => setModal(null);

  // Gọi API -> đóng hộp thoại -> tải lại dữ liệu -> hiện thông báo thành công.
  // Lỗi hiện trong hộp thoại (nếu đang mở) hoặc ở đầu trang.
  const runAction = async (request, successText) => {
    setSaving(true);
    setModalError('');
    setMessage(null);
    try {
      await request();
      setModal(null);
      await loadData();
      setMessage({ type: 'success', text: successText });
    } catch (err) {
      if (modal) setModalError(err.message);
      else setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Quy trình tuyển dụng ---------------- */

  const handleApplicantAction = async (type, application) => {
    if (type === 'PROFILE') {
      try {
        const profile = await candidateService.getCandidateProfile(application.candidateId);
        openModal({ kind: 'PROFILE', application, profile });
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
      return;
    }
    openModal({ kind: 'HIRING', type, application });
  };

  const handleHiringSubmit = (data) => {
    const { type, application: app } = modal;
    const requests = {
      SHORTLIST: () => hiringService.shortlist(app.id, data.note),
      INTERVIEW: () => hiringService.scheduleInterview({ applicationId: app.id, ...data }),
      FEEDBACK: () => hiringService.submitFeedback(app.interview.id, { ...data, score: Number(data.score) }),
      OFFER: () => hiringService.createOffer(app.id, { ...data, salary: Number(data.salary) }),
      REJECT: () => applicationService.reject(app.id, data.reason),
    };
    const successTexts = {
      SHORTLIST: `Đã đưa ${app.candidateName} vào vòng trong.`,
      INTERVIEW: `Đã hẹn phỏng vấn với ${app.candidateName}.`,
      FEEDBACK: data.result === 'PASS'
        ? `${app.candidateName} đã đạt phỏng vấn, bạn có thể gửi Offer.`
        : `Đã ghi nhận ${app.candidateName} không đạt phỏng vấn.`,
      OFFER: `Đã gửi Offer cho ${app.candidateName}.`,
      REJECT: `Đã từ chối hồ sơ của ${app.candidateName}.`,
    };
    runAction(requests[type], successTexts[type]);
  };

  /* ---------------- Tin tuyển dụng ---------------- */

  const openCreateJob = () => {
    if (companies.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng tạo trang công ty trước khi đăng tin.' });
      setActiveTab('companies');
      return;
    }
    openModal({ kind: 'JOB', job: null });
  };

  const handleSaveJob = (payload) => {
    const { job } = modal;
    if (job) {
      runAction(() => jobService.updateJob(job.id, payload), 'Đã cập nhật tin tuyển dụng.');
    } else {
      runAction(() => jobService.createJob(payload), 'Đã đăng tin tuyển dụng mới.');
    }
  };

  const handleCloseJob = (job) => {
    if (!window.confirm(`Đóng tin "${job.title}"? Ứng viên sẽ không thể nộp thêm hồ sơ.`)) return;
    runAction(() => jobService.closeJob(job.id), `Đã đóng tin "${job.title}".`);
  };

  const handleReopenJob = (job) => {
    const payload = toJobPayload({ ...jobToForm(job), status: 'OPEN' });
    runAction(() => jobService.updateJob(job.id, payload), `Đã mở lại tin "${job.title}".`);
  };

  /* ---------------- Công ty ---------------- */

  const handleSaveCompany = (form) => {
    const { company } = modal;
    if (company) {
      runAction(() => companyService.updateCompany(company.id, form), 'Đã cập nhật công ty.');
    } else {
      runAction(() => companyService.createCompany(form), `Đã tạo công ty "${form.name}".`);
    }
  };

  const handleDeleteCompany = (company) => {
    if (!window.confirm(`Xóa công ty "${company.name}"?`)) return;
    runAction(() => companyService.deleteCompany(company.id), 'Đã xóa công ty.');
  };

  /* ---------------- Hiển thị ---------------- */

  const countByStatus = (status) => applications.filter((a) => a.status === status).length;

  const stats = [
    ['Tin đang tuyển', jobs.filter((j) => j.status === 'OPEN').length],
    ['Tổng hồ sơ', applications.length],
    ['Chờ duyệt', countByStatus('APPLIED')],
    ['Đang phỏng vấn', countByStatus('INTERVIEW_SCHEDULED')],
    ['Đã nhận việc', countByStatus('HIRED')],
  ];

  const menuItems = [
    { key: 'applicants', label: 'Hồ sơ ứng tuyển', count: applications.length },
    { key: 'jobs', label: 'Tin tuyển dụng', count: jobs.length },
    { key: 'companies', label: 'Công ty', count: companies.length },
  ];

  return (
    <DashboardLayout title="Nhà tuyển dụng" menuItems={menuItems} activeKey={activeTab} onSelect={setActiveTab}>
      <div className="page-header">
        <h1 className="page-title">{SECTION_TITLES[activeTab]}</h1>
        <div className="page-header-actions">
          {activeTab === 'companies'
            ? <button type="button" className="btn btn-primary" onClick={() => openModal({ kind: 'COMPANY', company: null })}>Thêm công ty</button>
            : <button type="button" className="btn btn-primary" onClick={openCreateJob}>Đăng tin mới</button>}
        </div>
      </div>

      <Alert message={message} onClose={() => setMessage(null)} />

      {loading ? (
        <Loading />
      ) : (
        <>
          {activeTab === 'applicants' && (
            <>
              <div className="stat-grid">
                {stats.map(([label, value]) => (
                  <div key={label} className="stat">
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value}</div>
                  </div>
                ))}
              </div>
              <ApplicantsSection applications={applications} jobs={jobs} onAction={handleApplicantAction} />
            </>
          )}

          {activeTab === 'jobs' && (
            <JobsSection
              jobs={jobs}
              applications={applications}
              onCreate={openCreateJob}
              onEdit={(job) => openModal({ kind: 'JOB', job })}
              onClose={handleCloseJob}
              onReopen={handleReopenJob}
            />
          )}

          {activeTab === 'companies' && (
            <CompaniesSection
              companies={companies}
              onCreate={() => openModal({ kind: 'COMPANY', company: null })}
              onEdit={(company) => openModal({ kind: 'COMPANY', company })}
              onDelete={handleDeleteCompany}
            />
          )}
        </>
      )}

      {/* ===== Hộp thoại ===== */}
      {modal?.kind === 'JOB' && (
        <JobFormModal job={modal.job} companies={companies} industries={industries} jobTypes={jobTypes}
          saving={saving} error={modalError} onSubmit={handleSaveJob} onClose={closeModal} />
      )}
      {modal?.kind === 'COMPANY' && (
        <CompanyFormModal company={modal.company} saving={saving} error={modalError} onSubmit={handleSaveCompany} onClose={closeModal} />
      )}
      {modal?.kind === 'HIRING' && (
        <HiringActionModal type={modal.type} application={modal.application}
          saving={saving} error={modalError} onSubmit={handleHiringSubmit} onClose={closeModal} />
      )}
      {modal?.kind === 'PROFILE' && (
        <CandidateProfileModal profile={modal.profile} application={modal.application} onClose={closeModal} />
      )}
    </DashboardLayout>
  );
}
