class RecommendationService {
  constructor({ recommendationRepository, logger }) {
    this.recommendationRepository = recommendationRepository;
    this.logger = logger;
  }

  async listRecommendations() {
    const map = (await this.recommendationRepository.getAll()) || {};
    this.logger?.info("recommendations_loaded", { count: Object.keys(map).length });
    return map;
  }
}

module.exports = { RecommendationService };
