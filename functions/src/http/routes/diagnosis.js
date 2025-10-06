function registerDiagnosisRoutes(app, container, wrap) {
  app.post(
    "/webhook-diagnosis",
    wrap(async ({ services }, req, res) => {
      const userPayload = await services.authService.requireUserFromRequest(req);
      const result = await services.diagnosisService.saveDiagnosis(userPayload, req.body);
      res.json(result);
    })
  );

  app.get(
    "/diagnosis",
    wrap(async ({ services }, req, res) => {
      const userPayload = await services.authService.requireUserFromRequest(req);
      const diagnosis = await services.diagnosisService.getDiagnosis(userPayload);
      res.json(diagnosis || {});
    })
  );
}

module.exports = { registerDiagnosisRoutes };
