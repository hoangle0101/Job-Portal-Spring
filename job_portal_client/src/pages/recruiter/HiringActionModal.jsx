import { useState } from 'react';
import { formatSalary } from '../../utils/format';
import Modal from '../../components/common/Modal';

// Tiêu đề và dữ liệu ban đầu của từng bước tuyển dụng
const ACTIONS = {
  SHORTLIST: { title: 'Đưa vào vòng trong', initial: { note: '' } },
  INTERVIEW: { title: 'Hẹn lịch phỏng vấn', initial: { startTime: '', endTime: '', meetingLink: '', location: '' } },
  FEEDBACK: { title: 'Chấm điểm phỏng vấn', initial: { score: 70, result: 'PASS', comments: '' } },
  OFFER: { title: 'Gửi Offer', initial: { salary: '', startDate: '', notes: '' } },
  REJECT: { title: 'Từ chối hồ sơ', initial: { reason: '' } },
};

const today = () => new Date().toISOString().slice(0, 10);

// Hộp thoại cho các bước: Shortlist, Hẹn PV, Chấm PV, Gửi Offer, Từ chối.
// onSubmit(data) gửi dữ liệu form lên trang cha để gọi API.
export default function HiringActionModal({ type, application, saving, error, onSubmit, onClose }) {
  const [data, setData] = useState(ACTIONS[type].initial);

  const updateField = (field) => (e) => setData({ ...data, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <Modal title={ACTIONS[type].title} onClose={onClose} error={error}>
      <div className="modal-context">
        <strong>{application.candidateName}</strong> · {application.jobTitle}
      </div>

      <form onSubmit={handleSubmit}>
        {type === 'SHORTLIST' && (
          <div className="form-group">
            <label className="form-label" htmlFor="note">Ghi chú nội bộ</label>
            <textarea id="note" className="form-input" rows={3} value={data.note} onChange={updateField('note')} />
            <p className="form-hint">Ghi chú chỉ nhà tuyển dụng nhìn thấy.</p>
          </div>
        )}

        {type === 'INTERVIEW' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="startTime">Bắt đầu <span className="required">*</span></label>
                <input id="startTime" type="datetime-local" className="form-input" required value={data.startTime} onChange={updateField('startTime')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="endTime">Kết thúc <span className="required">*</span></label>
                <input id="endTime" type="datetime-local" className="form-input" required value={data.endTime} onChange={updateField('endTime')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="meetingLink">Link họp online</label>
              <input id="meetingLink" type="url" className="form-input" placeholder="https://meet.google.com/..." value={data.meetingLink} onChange={updateField('meetingLink')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="location">Địa điểm phỏng vấn trực tiếp</label>
              <input id="location" className="form-input" value={data.location} onChange={updateField('location')} />
              <p className="form-hint">Nhập link online hoặc địa điểm (ít nhất một trong hai).</p>
            </div>
          </>
        )}

        {type === 'FEEDBACK' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="score">Điểm (0 - 100)</label>
                <input id="score" type="number" min="0" max="100" required className="form-input" value={data.score} onChange={updateField('score')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="result">Kết quả</label>
                <select id="result" className="form-input" value={data.result} onChange={updateField('result')}>
                  <option value="PASS">Đạt</option>
                  <option value="FAIL">Không đạt</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="comments">Nhận xét</label>
              <textarea id="comments" className="form-input" rows={3} value={data.comments} onChange={updateField('comments')} />
              <p className="form-hint">Kết quả "Không đạt" sẽ chuyển hồ sơ sang trạng thái Không phù hợp.</p>
            </div>
          </>
        )}

        {type === 'OFFER' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="salary">Mức lương (VNĐ/tháng) <span className="required">*</span></label>
                <input id="salary" type="number" min="1" step="500000" required className="form-input" value={data.salary} onChange={updateField('salary')} />
                {data.salary && <p className="form-hint">{formatSalary(data.salary)}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="startDate">Ngày bắt đầu <span className="required">*</span></label>
                <input id="startDate" type="date" required min={today()} className="form-input" value={data.startDate} onChange={updateField('startDate')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="notes">Ghi chú / điều khoản</label>
              <textarea id="notes" className="form-input" rows={3} value={data.notes} onChange={updateField('notes')} />
            </div>
          </>
        )}

        {type === 'REJECT' && (
          <div className="form-group">
            <label className="form-label" htmlFor="reason">Lý do từ chối</label>
            <textarea id="reason" className="form-input" rows={3} value={data.reason} onChange={updateField('reason')}
              placeholder="VD: Kinh nghiệm chưa phù hợp với yêu cầu vị trí." />
            <p className="form-hint">Lý do sẽ được gửi cho ứng viên.</p>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button type="submit" disabled={saving} className={`btn ${type === 'REJECT' ? 'btn-danger-solid' : 'btn-primary'}`}>
            {saving ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
