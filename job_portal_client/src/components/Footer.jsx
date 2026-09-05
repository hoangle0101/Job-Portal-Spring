import React from 'react';
import { Briefcase, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border)', padding: '48px 0 24px', marginTop: '80px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Briefcase size={20} color="var(--primary)" />
            <span style={{ fontWeight: '800', fontSize: '18px' }}>JobPortal Enterprise</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Nền tảng kết nối nhân tài và doanh nghiệp chuẩn quốc tế.</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span className="badge badge-neutral">☕ Spring Boot 4.1.1</span>
          <span className="badge badge-neutral">⚡ Gradle 9.7</span>
          <span className="badge badge-neutral">🐬 MySQL 8.0</span>
          <span className="badge badge-neutral">⚛️ React 19 + Vite</span>
        </div>
      </div>
      <div className="container" style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}>
        Mock Project FPT 2026 • Thực hiện bởi <strong>Hoàng & Nguyên</strong>
      </div>
    </footer>
  );
}
