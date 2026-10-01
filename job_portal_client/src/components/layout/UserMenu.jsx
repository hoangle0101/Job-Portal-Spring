import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useClickOutside from '../../hooks/useClickOutside';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import { ROLE_LABELS } from '../../utils/format';

// Ảnh đại diện + tên ở góc phải header; bấm vào mở menu tài khoản
export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useClickOutside(() => setIsOpen(false));

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="dropdown" ref={menuRef}>
      <button type="button" className="user-button" onClick={() => setIsOpen(!isOpen)}>
        <Avatar name={user.fullName} avatarUrl={user.avatarUrl} />
        <span className="user-button-name">{user.fullName}</span>
        <Icon name="chevronDown" size={16} />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="user-menu-info">
            <strong>{user.fullName}</strong>
            <span>{user.email} · {ROLE_LABELS[user.role]}</span>
          </div>
          <Link to="/account" className="dropdown-item" onClick={() => setIsOpen(false)}>Tài khoản của tôi</Link>
          <button type="button" className="dropdown-item" onClick={handleLogout}>Đăng xuất</button>
        </div>
      )}
    </div>
  );
}
