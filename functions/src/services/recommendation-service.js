class RecommendationService {
  constructor({ recommendationRepository }) {
    this.recommendationRepository = recommendationRepository;
  }

  async listRecommendations() {
    return this.recommendationRepository.getAll();
  }
}

module.exports = { RecommendationService };
