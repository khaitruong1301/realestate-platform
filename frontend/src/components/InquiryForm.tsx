import { useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { propertyApi } from '../api/properties';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: 'Tôi quan tâm bất động sản này, vui lòng liên hệ lại.' });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await propertyApi.sendInquiry(propertyId, { ...form, email: form.email || undefined });
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiError && err.details ? Object.values(err.details).flat().join('. ') : 'Gửi thất bại, vui lòng thử lại.');
    }
  };

  if (status === 'sent') return <p className="alert alert--success">Đã gửi! Môi giới sẽ liên hệ bạn sớm.</p>;

  return (
    <form className="inquiry" onSubmit={submit}>
      <h3>Yêu cầu tư vấn</h3>
      <input aria-label="Họ tên" placeholder="Họ tên *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input aria-label="Số điện thoại" placeholder="Số điện thoại *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input aria-label="Email" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <textarea aria-label="Lời nhắn" rows={3} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      {status === 'error' && <p className="alert alert--error">{error}</p>}
      <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Đang gửi...' : 'Gửi yêu cầu'}</button>
    </form>
  );
}
