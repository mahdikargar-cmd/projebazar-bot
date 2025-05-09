"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bot_1 = require("./interfaces/bot");
bot_1.default.launch()
    .then(function () { return console.log('ربات با موفقیت شروع شد'); })
    .catch(function (err) { return console.error('خطا در شروع ربات:', err); });
