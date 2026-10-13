import { fileUrl, getInitials } from '../../utils/format';

// Logo công ty; nếu chưa có logo thì hiện chữ cái đầu của tên công ty
export default function CompanyLogo({ name, logoUrl, size = 56 }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) };

  if (logoUrl) {
    return (
      <div className="company-logo" style={style}>
        <img src={fileUrl(logoUrl)} alt={name} />
      </div>
    );
  }
  return (
    <div className="company-logo company-logo-placeholder" style={style}>
      {getInitials(name)}
    </div>
  );
}
