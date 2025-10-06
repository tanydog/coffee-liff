function registerHealthRoutes(app) {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
}

module.exports = { registerHealthRoutes };
