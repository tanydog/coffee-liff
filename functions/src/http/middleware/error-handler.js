const { isHttpError } = require("../../utils/http-error");

function createErrorHandler() {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, _next) => {
    const requestId = req.context?.requestId || null;
    const logger = req.context?.logger;
    logger?.error("request_error", { message: err.message, stack: err.stack, requestId });
    if (!logger && process.env.NODE_ENV !== "production") {
      console.error("[http]", err);
    }
    if (isHttpError(err)) {
      return res.status(err.statusCode).json({ error: err.message, requestId });
    }
    return res.status(500).json({ error: "internal_error", requestId });
  };
}

module.exports = { createErrorHandler };
