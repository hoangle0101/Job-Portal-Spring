import { APPLICATION_STATUS } from '../../utils/format';

// Nhãn trạng thái của đơn ứng tuyển (APPLIED, SHORTLISTED, ...)
export default function StatusBadge({ status }) {
  const info = APPLICATION_STATUS[status] || { label: status, tone: 'gray' };
  return <span className={`badge badge-${info.tone}`}>{info.label}</span>;
}
