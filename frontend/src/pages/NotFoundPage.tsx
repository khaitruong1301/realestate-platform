import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="empty">
      <h1>404</h1>
      <p>Trang bạn tìm không tồn tại.</p>
      <Link to="/">← Về trang chủ</Link>
    </div>
  );
}
