import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService, companyService } from '../services/jobPortalService';
import { ROLE_LABELS, formatDate } from '../utils/format';
import DashboardLayout from '../components/layout/DashboardLayout';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';

const emptyCatalogForm = { id: null, name: '', description: '' };

// Bảng CRUD dùng chung cho Ngành nghề và Hình thức làm việc
function CatalogTable({ itemName, items, hasDescription, onCreate, onUpdate, onDelete }) {
  const [form, setForm] = useState(emptyCatalogForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name: form.name, description: form.description };
    const ok = form.id ? await onUpdate(form.id, data) : await onCreate(data);
    if (ok) setForm(emptyCatalogForm);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="card catalog-form">
        <div className="catalog-form-field">
          <label className="form-label" htmlFor="catalogName">{form.id ? `Sửa ${itemName}` : `Thêm ${itemName}`}</label>
          <input id="catalogName" className="form-input" required placeholder="Tên" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        {hasDescription && (
          <div className="catalog-form-field catalog-form-field-wide">
            <label className="form-label" htmlFor="catalogDescription">Mô tả</label>
            <input id="catalogDescription" className="form-input" placeholder="Mô tả ngắn" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        )}
        <div className="catalog-form-buttons">
          {form.id && <button type="button" className="btn btn-secondary" onClick={() => setForm(emptyCatalogForm)}>Hủy</button>}
          <button type="submit" className="btn btn-primary">{form.id ? 'Lưu' : 'Thêm'}</button>
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState title={`Chưa có ${itemName} nào`} />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th>
                {hasDescription && <th>Mô tả</th>}
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-title">{item.name}</td>
                  {hasDescription && <td className="text-secondary">{item.description}</td>}
                  <td className="col-actions">
                    <div className="table-actions">
                      <button type="button" className="btn btn-secondary btn-sm"
                        onClick={() => setForm({ id: item.id, name: item.name, description: item.description || '' })}>Sửa</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(item)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const SECTION_TITLES = {
  users: 'Người dùng',
  industries: 'Ngành nghề',
  jobTypes: 'Hình thức làm việc',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      const [userData, industryData, typeData] = await Promise.all([
        adminService.getUsers(),
        companyService.getIndustries(),
        companyService.getJobTypes(),
      ]);
      setUsers(userData || []);
      setIndustries(industryData || []);
      setJobTypes(typeData || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Chạy thao tác -> hiện thông báo -> tải lại dữ liệu. Trả về true nếu thành công.
  const run = async (action, successText) => {
    setMessage(null);
    try {
      await action();
      setMessage({ type: 'success', text: successText });
      await loadData();
      return true;
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      return false;
    }
  };

  const toggleUser = (u) => {
    const question = u.active ? `Khóa tài khoản ${u.email}?` : `Mở khóa tài khoản ${u.email}?`;
    if (!window.confirm(question)) return;
    run(() => adminService.setUserActive(u.id, !u.active), u.active ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.');
  };

  const confirmDelete = (item, action) => {
    if (!window.confirm(`Xóa "${item.name}"?`)) return Promise.resolve(false);
    return run(action, 'Đã xóa.');
  };

  const menuItems = [
    { key: 'users', label: 'Người dùng', count: users.length },
    { key: 'industries', label: 'Ngành nghề', count: industries.length },
    { key: 'jobTypes', label: 'Hình thức làm việc', count: jobTypes.length },
  ];

  return (
    <DashboardLayout title="Quản trị hệ thống" menuItems={menuItems} activeKey={tab} onSelect={setTab}>
      <div className="page-header">
        <h1 className="page-title">{SECTION_TITLES[tab]}</h1>
      </div>

      <Alert message={message} onClose={() => setMessage(null)} />

      {tab === 'users' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="cell-title">{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{ROLE_LABELS[u.role]}</td>
                  <td className="text-secondary">{formatDate(u.createdAt)}</td>
                  <td>
                    <span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>{u.active ? 'Hoạt động' : 'Đã khóa'}</span>
                  </td>
                  <td className="col-actions">
                    {/* Admin không tự khóa chính mình */}
                    {u.id !== user.id && (
                      <button type="button" className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleUser(u)}>
                        {u.active ? 'Khóa' : 'Mở khóa'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'industries' && (
        <CatalogTable
          itemName="ngành nghề"
          items={industries}
          hasDescription
          onCreate={(data) => run(() => adminService.createIndustry(data), 'Đã thêm ngành nghề.')}
          onUpdate={(id, data) => run(() => adminService.updateIndustry(id, data), 'Đã cập nhật ngành nghề.')}
          onDelete={(item) => confirmDelete(item, () => adminService.deleteIndustry(item.id))}
        />
      )}

      {tab === 'jobTypes' && (
        <CatalogTable
          itemName="hình thức làm việc"
          items={jobTypes}
          onCreate={(data) => run(() => adminService.createJobType(data), 'Đã thêm hình thức làm việc.')}
          onUpdate={(id, data) => run(() => adminService.updateJobType(id, data), 'Đã cập nhật hình thức làm việc.')}
          onDelete={(item) => confirmDelete(item, () => adminService.deleteJobType(item.id))}
        />
      )}
    </DashboardLayout>
  );
}
