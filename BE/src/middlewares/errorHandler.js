export class HttpError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFoundHandler(req, res, next) {
  next(new HttpError(404, "NOT_FOUND", "요청한 API를 찾을 수 없습니다."));
}

export function errorHandler(error, req, res, _next) {
  const status = error.status || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const message = error.message || "서버 오류가 발생했습니다.";

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      code,
      message,
      details: error.details || [],
    },
  });
}
