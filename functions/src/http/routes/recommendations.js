function registerRecommendationRoutes(app, container, wrap) {
  app.get(
    "/recommendations",
    wrap(async ({ services }, _req, res) => {
      const map = await services.recommendationService.listRecommendations();
      res.json(map);
    })
  );
}

module.exports = { registerRecommendationRoutes };
