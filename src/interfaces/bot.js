"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToChannel = void 0;
var telegraf_1 = require("telegraf");
var startHandler_1 = require("./handlers/startHandler");
var contactHandler_1 = require("./handlers/contactHandler");
var projectHandler_1 = require("./handlers/projectHandler");
var bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
// فعال‌سازی session
bot.use((0, telegraf_1.session)());
bot.start(startHandler_1.startHandler);
bot.on('contact', contactHandler_1.contactHandler);
bot.command('newproject', projectHandler_1.projectHandler);
bot.action(['gateway', 'admin'], projectHandler_1.paymentMethodHandler);
exports.default = bot;
var postToChannel_1 = require("./postToChannel");
Object.defineProperty(exports, "postToChannel", { enumerable: true, get: function () { return postToChannel_1.postToChannel; } });
