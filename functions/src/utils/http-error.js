class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function createHttpError(statusCode, message) {
  return new HttpError(statusCode, message);
}

function isHttpError(err) {
  return err instanceof HttpError || (err && typeof err.statusCode === "number");
}

module.exports = { HttpError, createHttpError, isHttpError };
