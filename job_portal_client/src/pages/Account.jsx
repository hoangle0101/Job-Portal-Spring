import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, fileService } from '../services/jobPortalService';
import { ROLE_LABELS } from '../utils/format';
import Alert from '../components/common/Alert';
import Avatar from '../components/common/Avatar';

const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function Account() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({ fullName: user.fullName || '', phone: user.phone || '', avatarUrl: user.avatarUrl || '' });
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload ảnh trước để lấy đường dẫn, sau đó bấm "Lưu" mới cập nhật vào tài khoản
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const uploaded = await fileService.uploadFile(file, 'avatars');
      setForm((current) => ({ ...current, avatarUrl: uploaded.fileUrl }));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      updateUser(await authService.updateMe(form));
      setMessage({ type: 'success', text: 'Đã cập nhật thông tin tài khoản.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    try {
      await authService.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords(emptyPasswords);
      setMessage({ type: 'success', text: 'Đã đổi mật khẩu.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="page">
      <div className="container container-narrow">
        <div className="page-header">
          <div>
            <h1 className="page-title">Tài khoản của tôi</h1>
            <p className="page-subtitle">{user.email} · {ROLE_LABELS[user.role]}</p>
          </div>
        </div>

        <Alert message={message} onClose={() => setMessage(null)} />

        <form className="card" onSubmit={handleSaveInfo}>
          <h2 className="card-title">Thông tin cá nhân</h2>

          <div className="avatar-upload">
            <Avatar name={form.fullName} avatarUrl={form.avatarUrl} size={72} />
            <div>
              <label className="btn btn-secondary btn-sm">
                {uploading ? 'Đang tải ảnh...' : 'Đổi ảnh đại diện'}
                <input type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={handleAvatarChange} disabled={uploading} />
              </label>
              <p className="form-hint">JPG, PNG hoặc WEBP.</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Họ và tên <span className="required">*</span></label>
              <input id="fullName" className="form-input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Số điện thoại</label>
              <input id="phone" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving || uploading} className="btn btn-primary">
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>

        <form className="card" onSubmit={handleChangePassword}>
          <h2 className="card-title">Đổi mật khẩu</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="currentPassword">Mật khẩu hiện tại</label>
            <input id="currentPassword" type="password" className="form-input" required value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">Mật khẩu mới</label>
              <input id="newPassword" type="password" className="form-input" required minLength={6} placeholder="Tối thiểu 6 ký tự"
                value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Nhập lại mật khẩu mới</label>
              <input id="confirmPassword" type="password" className="form-input" required minLength={6}
                value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Đổi mật khẩu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
