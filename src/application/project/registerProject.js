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
exports.RegisterProject = void 0;
var bot_1 = require("../../interfaces/bot");
var RegisterProject = /** @class */ (function () {
    function RegisterProject(userRepo, projectRepo) {
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
    }
    RegisterProject.prototype.execute = function (telegramId, description, budget, deadline, paymentMethod, bot) {
        return __awaiter(this, void 0, void 0, function () {
            var user, project_1, project;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepo.getUserByTelegramId(telegramId)];
                    case 1:
                        user = _a.sent();
                        if (!user || !user.phone) {
                            throw new Error('کاربر ثبت‌نام نکرده یا شماره تلفن ندارد.');
                        }
                        if (!(user.coins >= 30)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.userRepo.decreaseCoinsByPhone(user.phone, 30)];
                    case 2:
                        _a.sent();
                        project_1 = {
                            telegramId: telegramId,
                            description: description,
                            budget: budget,
                            deadline: deadline,
                            paymentStatus: 'completed',
                        };
                        return [4 /*yield*/, this.projectRepo.createProject(project_1)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, (0, bot_1.postToChannel)(bot, { description: description, budget: budget, deadline: deadline, telegramId: telegramId })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                    case 5:
                        project = {
                            telegramId: telegramId,
                            description: description,
                            budget: budget,
                            deadline: deadline,
                            paymentStatus: 'pending',
                            paymentMethod: paymentMethod,
                        };
                        return [4 /*yield*/, this.projectRepo.createProject(project)];
                    case 6:
                        _a.sent();
                        if (!(paymentMethod === 'admin')) return [3 /*break*/, 7];
                        throw new Error('لطفاً با ادمین (@AdminID) تماس بگیرید.');
                    case 7: 
                    // حالت تستی: فرض می‌کنیم پرداخت موفق است
                    return [4 /*yield*/, this.projectRepo.updatePaymentStatus(1, 'completed')];
                    case 8:
                        // حالت تستی: فرض می‌کنیم پرداخت موفق است
                        _a.sent(); // برای تست، فرض می‌کنیم projectId=1
                        return [4 /*yield*/, (0, bot_1.postToChannel)(bot, { description: description, budget: budget, deadline: deadline, telegramId: telegramId })];
                    case 9:
                        _a.sent();
                        throw new Error('پرداخت تستی موفق بود! پست به کانال ارسال شد.');
                }
            });
        });
    };
    return RegisterProject;
}());
exports.RegisterProject = RegisterProject;
