"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodHandler = exports.projectHandler = void 0;
var container_1 = require("../../shared/container");
var projectHandler = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var telegramId, message, description, budget, deadline;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        telegramId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        message = (_c = (_b = ctx.message) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.split('\n');
        if (!message || message.length < 3) {
            ctx.reply('لطفاً اطلاعات پروژه را به این شکل وارد کنید:\nتوضیحات\nبودجه\nمهلت');
            return [2 /*return*/];
        }
        description = message[0], budget = message[1], deadline = message[2];
        ctx.reply('روش پرداخت را انتخاب کنید:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'تست پرداخت (موقت)', callback_data: 'gateway' }],
                    [{ text: 'واسط ادمین', callback_data: 'admin' }],
                ],
            },
        });
        ctx.session = { telegramId: telegramId, description: description, budget: budget, deadline: deadline };
        return [2 /*return*/];
    });
}); };
exports.projectHandler = projectHandler;
var paymentMethodHandler = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var paymentMethod, _a, telegramId, description, budget, deadline, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                paymentMethod = (_b = ctx.callbackQuery) === null || _b === void 0 ? void 0 : _b.data;
                _a = ctx.session || {}, telegramId = _a.telegramId, description = _a.description, budget = _a.budget, deadline = _a.deadline;
                if (!telegramId || !description || !budget || !deadline) {
                    ctx.reply('خطا در اطلاعات پروژه.');
                    return [2 /*return*/];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, container_1.registerProject.execute(telegramId, description, budget, deadline, paymentMethod, ctx.telegram)];
            case 2:
                _c.sent();
                ctx.reply('پردازش پروژه انجام شد.');
                return [3 /*break*/, 4];
            case 3:
                error_1 = _c.sent();
                ctx.reply(error_1.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.paymentMethodHandler = paymentMethodHandler;
