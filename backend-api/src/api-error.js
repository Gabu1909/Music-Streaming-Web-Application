class ApiError extends Error {
  constructor(statusCode, message, headers = {}) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.headers = headers;
  }
}
module.exports = ApiError;
