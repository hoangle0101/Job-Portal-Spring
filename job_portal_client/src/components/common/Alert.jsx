import Icon from './Icon';

// Hộp thông báo lỗi / thành công. message = { type: 'success' | 'error' | 'info', text }
export default function Alert({ message, onClose }) {
  if (!message?.text) return null;

  return (
    <div className={`alert alert-${message.type || 'info'}`} role="alert">
      <span>{message.text}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Đóng thông báo">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
