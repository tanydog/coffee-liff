function registerLogRoutes(app, container, wrap) {
  app.post(
    "/webhook-log",
    wrap(async ({ services }, req, res) => {
      const userPayload = await services.authService.requireUserFromRequest(req);
      const result = await services.logService.recordLog(userPayload, req.body);
      res.json(result);
    })
  );

  app.get(
    "/logs",
    wrap(async ({ services }, req, res) => {
      const userPayload = await services.authService.requireUserFromRequest(req);
      const items = await services.logService.listLogs(userPayload);
      res.json(items);
    })
  );
}

module.exports = { registerLogRoutes };
