const line = require("@line/bot-sdk");
const { asyncHandler } = require("../middleware/async-handler");

function registerLineWebhookRoute(app, container) {
  const { lineConfig, services } = container;

  app.post(
    "/webhook",
    line.middleware(lineConfig),
    asyncHandler(async (req, res) => {
      const events = req.body.events || [];
      const responses = await Promise.all(
        events.map(async (event) => {
          if (event.type !== "message" || event.message.type !== "text") {
            return null;
          }
          const userId = event.source.userId;
          const profile = await services.lineClient.getProfile(userId);
          await services.userService.upsertProfile(userId, {
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
          });
          return services.lineClient.replyMessage(event.replyToken, {
            type: "text",
            text: `こんにちは、${profile.displayName}さん！情報を記録しました☕`,
          });
        })
      );
      res.json(responses);
    })
  );
}

module.exports = { registerLineWebhookRoute };
