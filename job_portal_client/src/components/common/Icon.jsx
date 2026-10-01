// Bộ icon SVG nhỏ của ứng dụng. Chỉ dùng ở những chỗ cần thiết (ô tìm kiếm, chuông, đóng, sao đánh giá...).
const ICON_PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  location: (
    <>
      <path d="M12 21c-3.5-3.6-7-7.1-7-11a7 7 0 0 1 14 0c0 3.9-3.5 7.4-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9.5a6 6 0 0 1 12 0c0 5.5 2 7 2 7H4s2-1.5 2-7" />
      <path d="M10 20a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronLeft: <path d="m14.5 6-6 6 6 6" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8Z" />,
};

export default function Icon({ name, size = 18, filled = false, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
