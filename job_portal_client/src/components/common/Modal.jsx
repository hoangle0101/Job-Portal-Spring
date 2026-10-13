import { useEffect } from 'react';
import Icon from './Icon';
import Alert from './Alert';

// Hộp thoại dùng chung. size: 'md' | 'lg'. error: chuỗi lỗi hiển thị ở đầu nội dung.
export default function Modal({ title, onClose, error, size = 'md', children }) {
  // Nhấn phím Esc để đóng
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop">
      <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Đóng">
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-body">
          <Alert message={error ? { type: 'error', text: error } : null} />
          {children}
        </div>
      </div>
    </div>
  );
}
