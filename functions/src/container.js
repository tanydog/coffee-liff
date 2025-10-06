const line = require("@line/bot-sdk");
const { config } = require("./config");
const { db } = require("./firebase");
const { LogRepository } = require("./repositories/log-repository");
const { DiagnosisRepository } = require("./repositories/diagnosis-repository");
const { RecommendationRepository } = require("./repositories/recommendation-repository");
const { AuthService } = require("./services/auth-service");
const { LogService } = require("./services/log-service");
const { DiagnosisService } = require("./services/diagnosis-service");
const { RecommendationService } = require("./services/recommendation-service");
const { UserService } = require("./services/user-service");

function createContainer() {
  const lineConfig = {
    channelAccessToken: config.line.channelAccessToken,
    channelSecret: config.line.channelSecret,
  };

  const repositories = {
    logRepository: new LogRepository(db),
    diagnosisRepository: new DiagnosisRepository(db),
    recommendationRepository: new RecommendationRepository(db),
  };

  const services = {
    authService: new AuthService({ channelId: config.line.channelId }),
    logService: new LogService({ logRepository: repositories.logRepository }),
    diagnosisService: new DiagnosisService({ diagnosisRepository: repositories.diagnosisRepository }),
    recommendationService: new RecommendationService({ recommendationRepository: repositories.recommendationRepository }),
    userService: new UserService({ db }),
    lineClient: new line.Client(lineConfig),
  };

  return {
    config,
    db,
    services,
    lineConfig,
  };
}

module.exports = { createContainer };
