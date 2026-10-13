import { useEffect, useState } from 'react';
import { notificationService } from '../../services/jobPortalService';
import useClickOutside from '../../hooks/useClickOutside';
import Icon from '../common/Icon';
import { formatDateTime } from '../../utils/format';

const REFRESH_INTERVAL_MS = 30000;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const menuRef = useClickOutside(() => setIsOpen(false));

  const loadNotifications = async () => {
    try {
      setNotifications((await notificationService.getNotifications()) || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Tải ngay khi mở trang, sau đó tự làm mới mỗi 30 giây để thấy thông báo mới
  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggle = () => {
    if (!isOpen) loadNotifications();
    setIsOpen(!isOpen);
  };

  const handleRead = async (notification) => {
    if (notification.isRead) return;
    try {
      await notificationService.markAsRead(notification.id);
      setNotifications((list) => list.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dropdown" ref={menuRef}>
      <button type="button" className="icon-button" onClick={handleToggle} title="Thông báo">
        <Icon name="bell" size={20} />
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="dropdown-menu notification-menu">
          <div className="notification-menu-header">
            <strong>Thông báo</strong>
            {unreadCount > 0 && (
              <button type="button" className="btn-link" onClick={handleReadAll}>Đánh dấu tất cả đã đọc</button>
            )}
          </div>

          {error && <p className="notification-empty">{error}</p>}
          {!error && notifications.length === 0 && <p className="notification-empty">Bạn chưa có thông báo nào.</p>}
          {!error && notifications.length > 0 && (
            <div className="notification-list">
              {notifications.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  className={`notification-item ${n.isRead ? '' : 'unread'}`}
                  onClick={() => handleRead(n)}
                >
                  <div className="notification-item-title">{n.title}</div>
                  <p className="notification-item-message">{n.message}</p>
                  <span className="notification-item-time">{formatDateTime(n.createdAt)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
