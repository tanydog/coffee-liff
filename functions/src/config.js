const functions = require("firebase-functions");

function parseOrigins(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((o) => String(o).trim()).filter(Boolean);
  return String(input)
    .split(/[,\s]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

const cfg = functions.config ? functions.config() : {};

const defaultOrigins = [
  "https://<your-hosting>.web.app",
  "https://<your-custom-domain>",
];

const resolvedOrigins = parseOrigins(cfg?.app?.allowed_origins || process.env.ALLOWED_ORIGINS);

const config = {
  line: {
    channelAccessToken: cfg?.line?.channel_access_token || process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
    channelSecret: cfg?.line?.channel_secret || process.env.LINE_CHANNEL_SECRET || "",
    channelId: cfg?.line?.channel_id || process.env.LINE_CHANNEL_ID || "",
  },
  app: {
    allowedOrigins: resolvedOrigins.length ? resolvedOrigins : defaultOrigins,
  },
};

module.exports = { config, parseOrigins };
