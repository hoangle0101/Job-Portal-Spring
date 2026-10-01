import { fileUrl, getInitials } from '../../utils/format';

// Ảnh đại diện tròn; chưa có ảnh thì hiện chữ cái đầu của tên
export default function Avatar({ name, avatarUrl, size = 32 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}>
      {avatarUrl ? <img src={fileUrl(avatarUrl)} alt={name} /> : getInitials(name)}
    </span>
  );
}
