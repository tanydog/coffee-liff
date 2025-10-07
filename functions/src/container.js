const line = require("@line/bot-sdk");
const { config } = require("./config");
const { db } = require("./firebase");
const { createLogger } = require("./app/logger");
const { LogRepository } = require("./repositories/log-repository");
const { DiagnosisRepository } = require("./repositories/diagnosis-repository");
const { RecommendationRepository } = require("./repositories/recommendation-repository");
const { AuthService } = require("./services/auth-service");
const { LogService } = require("./services/log-service");
const { DiagnosisService } = require("./services/diagnosis-service");
const { RecommendationService } = require("./services/recommendation-service");
const { UserService } = require("./services/user-service");

function createContainer() {
  const logger = createLogger("coffee-liff");
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
    authService: new AuthService({ channelId: config.line.channelId, logger: logger.child("auth") }),
    logService: new LogService({ logRepository: repositories.logRepository, logger: logger.child("log") }),
    diagnosisService: new DiagnosisService({ diagnosisRepository: repositories.diagnosisRepository, logger: logger.child("diagnosis") }),
    recommendationService: new RecommendationService({ recommendationRepository: repositories.recommendationRepository, logger: logger.child("recommendation") }),
    userService: new UserService({ db, logger: logger.child("user") }),
    lineClient: new line.Client(lineConfig),
  };

  return {
    config,
    db,
    services,
    lineConfig,
    logger,
  };
}

module.exports = { createContainer };
