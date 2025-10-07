const { randomUUID } = require('crypto');

function createLogger(scope = 'app') {
  function format(level, requestId, message, meta) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      scope,
      requestId: requestId || null,
      message,
      ...meta,
    };
    return payload;
  }

  function log(level, requestId, message, meta) {
    const payload = format(level, requestId, message, meta);
    if (level === 'error') {
      console.error(JSON.stringify(payload));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(payload));
    } else {
      console.log(JSON.stringify(payload));
    }
  }

  return {
    child(childScope) {
      return createLogger(`${scope}:${childScope}`);
    },
    requestId() {
      return randomUUID();
    },
    info(message, meta = {}, requestId = null) {
      log('info', requestId, message, meta);
    },
    warn(message, meta = {}, requestId = null) {
      log('warn', requestId, message, meta);
    },
    error(message, meta = {}, requestId = null) {
      log('error', requestId, message, meta);
    },
  };
}

module.exports = { createLogger };
