function registerRecommendationRoutes(app, container, wrap) {
  app.get(
    "/recommendations",
    wrap(async ({ container: appContainer, req, res, requestContext }) => {
      const { services } = appContainer;
      requestContext.logger?.info("recommendations_requested", { auth: Boolean(req.headers.authorization) });
      const map = await services.recommendationService.listRecommendations();
      res.json(map);
    })
  );
}

module.exports = { registerRecommendationRoutes };
