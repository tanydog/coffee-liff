const fetch = globalThis.fetch || require("node-fetch");
const { createHttpError } = require("../utils/http-error");

async function verifyLineIdToken(idToken, channelId) {
  if (!idToken) {
    throw createHttpError(401, "missing_id_token");
  }
  if (!channelId) {
    throw createHttpError(500, "missing_channel_id");
  }

  const params = new URLSearchParams({ id_token: idToken, client_id: channelId });
  const response = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    const text = await response.text();
    throw createHttpError(401, `line_verification_failed:${response.status}:${text}`);
  }

  const payload = await response.json();
  if (!payload.sub) {
    throw createHttpError(401, "line_missing_sub");
  }
  return payload;
}

module.exports = { verifyLineIdToken };
