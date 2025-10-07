const { validateDiagnosisPayload } = require("../../validators/diagnosis-validator");

function registerDiagnosisRoutes(app, container, wrap) {
  app.post(
    "/webhook-diagnosis",
    wrap(async ({ container: appContainer, req, res, requestContext }) => {
      const { services } = appContainer;
      const userPayload = await services.authService.requireUserFromRequest(req);
      const payload = validateDiagnosisPayload(req.body);
      requestContext.logger?.info("diagnosis_request_validated", { userId: userPayload.sub });
      const result = await services.diagnosisService.saveDiagnosis(userPayload, payload);
      res.json(result);
    })
  );

  app.get(
    "/diagnosis",
    wrap(async ({ container: appContainer, req, res, requestContext }) => {
      const { services } = appContainer;
      const userPayload = await services.authService.requireUserFromRequest(req);
      requestContext.logger?.info("diagnosis_fetch_requested", { userId: userPayload.sub });
      const diagnosis = await services.diagnosisService.getDiagnosis(userPayload);
      res.json(diagnosis || {});
    })
  );
}

module.exports = { registerDiagnosisRoutes };
