import { useState } from 'react';
import Modal from '../../components/common/Modal';
import { emptyJobForm, jobToForm, toJobPayload } from './recruiterForms';

// Hộp thoại đăng / sửa tin tuyển dụng. job = null khi đăng tin mới.
export default function JobFormModal({ job, companies, industries, jobTypes, saving, error, onSubmit, onClose }) {
  const [form, setForm] = useState(() => (job ? jobToForm(job) : { ...emptyJobForm, companyId: companies[0]?.id || '' }));

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(toJobPayload(form));
  };

  return (
    <Modal title={job ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'} onClose={onClose} error={error} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="title">Tiêu đề công việc <span className="required">*</span></label>
          <input id="title" className="form-input" required value={form.title} onChange={updateField('title')} placeholder="VD: Java Spring Boot Developer" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="companyId">Công ty <span className="required">*</span></label>
            {/* Không đổi công ty của tin đã đăng */}
            <select id="companyId" className="form-input" value={form.companyId} disabled={!!job} onChange={updateField('companyId')}>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="salaryRange">Mức lương</label>
            <input id="salaryRange" className="form-input" value={form.salaryRange} onChange={updateField('salaryRange')} placeholder="VD: 15 - 25 triệu" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="industryId">Ngành nghề</label>
            <select id="industryId" className="form-input" value={form.industryId} onChange={updateField('industryId')}>
              <option value="">Chọn ngành nghề</option>
              {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="jobTypeId">Hình thức làm việc</label>
            <select id="jobTypeId" className="form-input" value={form.jobTypeId} onChange={updateField('jobTypeId')}>
              <option value="">Chọn hình thức</option>
              {jobTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="responsibilities">Mô tả công việc <span className="required">*</span></label>
          <textarea id="responsibilities" className="form-input" rows={4} required value={form.responsibilities} onChange={updateField('responsibilities')} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="requirements">Yêu cầu ứng viên <span className="required">*</span></label>
          <textarea id="requirements" className="form-input" rows={4} required value={form.requirements} onChange={updateField('requirements')} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="benefits">Quyền lợi</label>
          <textarea id="benefits" className="form-input" rows={3} value={form.benefits} onChange={updateField('benefits')} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Đang lưu...' : job ? 'Lưu thay đổi' : 'Đăng tin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
