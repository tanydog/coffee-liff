const { isHttpError } = require("../../utils/http-error");

function createErrorHandler() {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, _next) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[http]", err);
    }
    if (isHttpError(err)) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "internal_error" });
  };
}

module.exports = { createErrorHandler };
