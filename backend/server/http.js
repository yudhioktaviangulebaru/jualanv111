/**
 * server/http.js
 * Helper untuk response & error berkode.
 *
 * Struktur response semua endpoint:
 *   { message: "SUCCESS"|"FAIL", code: 200|201|400|401|404, data: ... }
 */

/** Hasil sukses dari controller, membawa kode status. */
class Result {
  constructor(code, data) {
    this.code = code;
    this.data = data;
  }
  /** 200 OK */
  static ok(data) { return new Result(200, data); }
  /** 201 Created */
  static created(data) { return new Result(201, data); }
}

/** Error berkode HTTP; dilempar controller, ditangkap router. */
class ApiError extends Error {
  /**
   * @param {number} code 400 | 401 | 404 ...
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
  static badRequest(msg) { return new ApiError(400, msg); }
  static unauthorized(msg) { return new ApiError(401, msg); }
  static notFound(msg) { return new ApiError(404, msg); }
}
