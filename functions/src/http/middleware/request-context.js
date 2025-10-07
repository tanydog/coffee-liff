function createRequestContextMiddleware(appLogger) {
  const httpLogger = appLogger.child('http');
  return (req, res, next) => {
    const requestId = appLogger.requestId();
    const baseMeta = { method: req.method, path: req.path };
    const requestLogger = {
      info(message, meta = {}) {
        httpLogger.info(message, { ...baseMeta, ...meta }, requestId);
      },
      warn(message, meta = {}) {
        httpLogger.warn(message, { ...baseMeta, ...meta }, requestId);
      },
      error(message, meta = {}) {
        httpLogger.error(message, { ...baseMeta, ...meta }, requestId);
      },
    };

    req.context = {
      requestId,
      logger: requestLogger,
    };

    res.on('finish', () => {
      requestLogger.info('request_completed', {
        statusCode: res.statusCode,
      });
    });

    next();
  };
}

module.exports = { createRequestContextMiddleware };
