// Khung trang quản lý: menu bên trái + nội dung bên phải (dùng cho Nhà tuyển dụng và Admin).
// menuItems: [{ key, label, count }], activeKey: mục đang chọn, onSelect(key): đổi mục
export default function DashboardLayout({ title, menuItems, activeKey, onSelect, children }) {
  return (
    <div className="page">
      <div className="container dashboard">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-title">{title}</div>
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`dashboard-nav-item ${activeKey === item.key ? 'active' : ''}`}
              onClick={() => onSelect(item.key)}
            >
              {item.label}
              {item.count !== undefined && <span className="dashboard-nav-count">{item.count}</span>}
            </button>
          ))}
        </aside>

        <section>{children}</section>
      </div>
    </div>
  );
}
