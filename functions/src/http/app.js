const express = require("express");
const cors = require("cors");
const { config } = require("../config");
const { registerRoutes } = require("./routes");
const { createErrorHandler } = require("./middleware/error-handler");
const { createRequestContextMiddleware } = require("./middleware/request-context");

function createHttpApp(container) {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (config.app.allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(createRequestContextMiddleware(container.logger));

  registerRoutes(app, container);

  app.use(createErrorHandler());

  return app;
}

module.exports = { createHttpApp };
