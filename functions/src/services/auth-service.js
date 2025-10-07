const { verifyLineIdToken } = require("../integrations/line");
const { createHttpError } = require("../utils/http-error");

class AuthService {
  constructor({ channelId, logger }) {
    this.channelId = channelId;
    this.logger = logger;
  }

  async requireUserFromRequest(req) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      throw createHttpError(401, "missing_bearer_token");
    }
    const payload = await verifyLineIdToken(token, this.channelId, this.logger);
    return payload;
  }
}

module.exports = { AuthService };
