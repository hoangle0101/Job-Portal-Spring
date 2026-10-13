// Khung hiển thị khi danh sách rỗng. action: nút / link tùy chọn (ví dụ "Tìm việc làm")
export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <p className="empty-state-title">{title}</p>
      {text && <p className="empty-state-text">{text}</p>}
      {action}
    </div>
  );
}
