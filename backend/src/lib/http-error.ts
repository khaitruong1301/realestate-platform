export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(message = 'Dữ liệu không hợp lệ', details?: unknown) {
    return new HttpError(400, message, details);
  }
  static unauthorized(message = 'Chưa đăng nhập') {
    return new HttpError(401, message);
  }
  static forbidden(message = 'Không có quyền thực hiện') {
    return new HttpError(403, message);
  }
  static notFound(message = 'Không tìm thấy') {
    return new HttpError(404, message);
  }
  static conflict(message: string) {
    return new HttpError(409, message);
  }
}
