const line = require("@line/bot-sdk");
function registerLineWebhookRoute(app, container, wrap) {
  const { lineConfig } = container;

  app.post(
    "/webhook",
    line.middleware(lineConfig),
    wrap(async ({ container: appContainer, req, res, requestContext }) => {
      const { services } = appContainer;
      const events = req.body.events || [];
      requestContext.logger?.info("line_webhook_received", { count: events.length });
      const responses = await Promise.all(
        events.map(async (event) => {
          if (event.type !== "message" || event.message.type !== "text") {
            return null;
          }
          const userId = event.source.userId;
          const profile = await services.lineClient.getProfile(userId);
          requestContext.logger?.info("line_webhook_profile", { userId });
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
