import Icon from './Icon';

// Hiển thị 5 ngôi sao. Truyền onChange để người dùng bấm chọn số sao (form đánh giá).
export default function StarRating({ value, onChange, size = 16 }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => {
        const star = <Icon name="star" size={size} filled={n <= value} className={n <= value ? '' : 'star-empty'} />;
        return onChange ? (
          <button type="button" key={n} onClick={() => onChange(n)} aria-label={`${n} sao`}>{star}</button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </span>
  );
}
