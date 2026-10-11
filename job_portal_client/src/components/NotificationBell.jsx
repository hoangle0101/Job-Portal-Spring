import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, LoaderCircle } from 'lucide-react';
import { notificationService } from '../services/jobPortalService';

const formatNotificationDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
};

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  const loadNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const result = await notificationService.getNotifications(userId);
      setNotifications(result || []);
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleNotificationClick = async (notification) => {
    if (notification.isRead) return;
    setMarkingId(notification.id);
    try {
      await notificationService.markAsRead(notification.id, userId);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, isRead: true } : item
      )));
    } catch (requestError) {
      setError(requestError.message || 'Không thể đánh dấu thông báo đã đọc.');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => setIsOpen((current) => !current)}
        title="Thông báo"
        aria-label={`Thông báo, ${unreadCount} chưa đọc`}
        style={{ position: 'relative', width: '40px', height: '40px', padding: 0 }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '-5px', right: '-5px', minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '999px', background: 'var(--danger)', color: '#fff', fontSize: '10px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', top: '48px', right: 0, width: 'min(360px, calc(100vw - 32px))', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 110 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <strong style={{ fontSize: '14px' }}>Thông báo</strong>
            {unreadCount > 0 && <span className="badge badge-primary">{unreadCount} chưa đọc</span>}
          </div>

          {loading && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}><LoaderCircle size={20} style={{ marginBottom: '6px' }} /><p style={{ fontSize: '13px' }}>Đang tải thông báo...</p></div>}
          {!loading && error && <p style={{ padding: '16px', color: 'var(--danger)', fontSize: '13px' }}>{error}</p>}
          {!loading && !error && notifications.length === 0 && <p style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Bạn chưa có thông báo mới.</p>}
          {!loading && !error && notifications.length > 0 && (
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ display: 'block', width: '100%', border: 0, borderBottom: '1px solid var(--border)', textAlign: 'left', padding: '13px 16px', background: notification.isRead ? 'var(--bg-surface)' : 'var(--primary-light)', cursor: notification.isRead ? 'default' : 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{notification.title}</strong>
                    {!notification.isRead && <span aria-label="Chưa đọc" style={{ width: '7px', height: '7px', flex: '0 0 auto', borderRadius: '50%', background: 'var(--danger)', marginTop: '5px' }} />}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5', margin: '4px 0' }}>{notification.message}</p>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {markingId === notification.id ? <LoaderCircle size={11} /> : notification.isRead ? <Check size={11} /> : null}
                    {formatNotificationDate(notification.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
