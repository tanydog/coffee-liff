const { asyncHandler } = require("../middleware/async-handler");
const { registerLogRoutes } = require("./logs");
const { registerDiagnosisRoutes } = require("./diagnosis");
const { registerRecommendationRoutes } = require("./recommendations");
const { registerLineWebhookRoute } = require("./line-webhook");
const { registerHealthRoutes } = require("./meta");

function registerRoutes(app, container) {
  const wrap = (fn) => asyncHandler(fn.bind(null, container));

  registerHealthRoutes(app);

  registerLineWebhookRoute(app, container);
  registerLogRoutes(app, container, wrap);
  registerDiagnosisRoutes(app, container, wrap);
  registerRecommendationRoutes(app, container, wrap);
}

module.exports = { registerRoutes };
