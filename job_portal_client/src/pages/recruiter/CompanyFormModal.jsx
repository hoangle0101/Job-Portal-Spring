import { useState } from 'react';
import { fileService } from '../../services/jobPortalService';
import { CITY_OPTIONS } from '../../utils/format';
import Modal from '../../components/common/Modal';
import CompanyLogo from '../../components/common/CompanyLogo';
import { companyToForm, emptyCompanyForm } from './recruiterForms';

// Hộp thoại tạo / sửa công ty (kèm logo và nhiều chi nhánh). company = null khi tạo mới.
export default function CompanyFormModal({ company, saving, error, onSubmit, onClose }) {
  const [form, setForm] = useState(() => (company ? companyToForm(company) : emptyCompanyForm));
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // ----- Chi nhánh -----
  const updateLocation = (index, field, value) => {
    setForm({ ...form, locations: form.locations.map((loc, i) => (i === index ? { ...loc, [field]: value } : loc)) });
  };
  const addLocation = () => setForm({ ...form, locations: [...form.locations, { address: '', city: 'Hà Nội' }] });
  const removeLocation = (index) => setForm({ ...form, locations: form.locations.filter((_, i) => i !== index) });

  // Upload logo trước để lấy đường dẫn, bấm "Lưu" mới ghi vào công ty
  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const uploaded = await fileService.uploadFile(file, 'logos');
      setForm((current) => ({ ...current, logoUrl: uploaded.fileUrl }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal title={company ? 'Sửa thông tin công ty' : 'Tạo trang công ty'} onClose={onClose} error={error || uploadError} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="logo-upload">
          <CompanyLogo name={form.name || 'Logo'} logoUrl={form.logoUrl} size={72} />
          <div>
            <label className="btn btn-secondary btn-sm">
              {uploading ? 'Đang tải logo...' : 'Tải logo lên'}
              <input type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={handleUploadLogo} disabled={uploading} />
            </label>
            <p className="form-hint">JPG, PNG hoặc WEBP.</p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="companyName">Tên công ty <span className="required">*</span></label>
            <input id="companyName" className="form-input" required value={form.name} onChange={updateField('name')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="website">Website</label>
            <input id="website" type="url" className="form-input" placeholder="https://..." value={form.website} onChange={updateField('website')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="description">Giới thiệu công ty</label>
          <textarea id="description" className="form-input" rows={4} value={form.description} onChange={updateField('description')} />
        </div>

        <div className="form-group">
          <span className="form-label">Chi nhánh <span className="required">*</span></span>
          {form.locations.map((loc, index) => (
            <div key={index} className="location-row">
              <select className="form-input" value={loc.city} onChange={(e) => updateLocation(index, 'city', e.target.value)}>
                {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="form-input" required placeholder="Số nhà, đường, quận..." value={loc.address}
                onChange={(e) => updateLocation(index, 'address', e.target.value)} />
              {form.locations.length > 1 && (
                <button type="button" className="btn btn-secondary" onClick={() => removeLocation(index)}>Xóa</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-link text-small" onClick={addLocation}>+ Thêm chi nhánh</button>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button type="submit" disabled={saving || uploading} className="btn btn-primary">{saving ? 'Đang lưu...' : 'Lưu công ty'}</button>
        </div>
      </form>
    </Modal>
  );
}
