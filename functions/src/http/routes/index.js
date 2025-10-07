const { asyncHandler } = require("../middleware/async-handler");
const { registerLogRoutes } = require("./logs");
const { registerDiagnosisRoutes } = require("./diagnosis");
const { registerRecommendationRoutes } = require("./recommendations");
const { registerLineWebhookRoute } = require("./line-webhook");
const { registerHealthRoutes } = require("./meta");

function registerRoutes(app, container) {
  const wrap = (handler) =>
    asyncHandler(async (req, res) => {
      const requestContext = req.context || { requestId: null, logger: null };
      return handler({ container, req, res, requestContext });
    });

  registerHealthRoutes(app);

  registerLineWebhookRoute(app, container, wrap);
  registerLogRoutes(app, container, wrap);
  registerDiagnosisRoutes(app, container, wrap);
  registerRecommendationRoutes(app, container, wrap);
}

module.exports = { registerRoutes };
