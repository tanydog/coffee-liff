const { validateLogPayload } = require("../../validators/log-validator");

function registerLogRoutes(app, container, wrap) {
  app.post(
    "/webhook-log",
    wrap(async ({ container: appContainer, req, res, requestContext }) => {
      const { services } = appContainer;
      const userPayload = await services.authService.requireUserFromRequest(req);
      const payload = validateLogPayload(req.body);
      requestContext.logger?.info("log_request_validated", { userId: userPayload.sub });
      const result = await services.logService.recordLog(userPayload, payload);
      res.json(result);
    })
  );

  app.get(
    "/logs",
    wrap(async ({ container: appContainer, req, res, requestContext }) => {
      const { services } = appContainer;
      const userPayload = await services.authService.requireUserFromRequest(req);
      requestContext.logger?.info("log_list_request", { userId: userPayload.sub });
      const items = await services.logService.listLogs(userPayload);
      res.json(items);
    })
  );
}

module.exports = { registerLogRoutes };
