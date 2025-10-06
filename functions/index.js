const functions = require("firebase-functions");
const { createContainer } = require("./src/container");
const { createHttpApp } = require("./src/http/app");

const container = createContainer();
const app = createHttpApp(container);

exports.app = functions.region("asia-northeast1").https.onRequest(app);
