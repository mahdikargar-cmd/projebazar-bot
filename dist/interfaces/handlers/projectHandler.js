"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodHandler = exports.projectHandler = void 0;
const container_1 = require("../../shared/container");
const projectHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const message = ctx.message?.text?.split('\n');
    if (!message || message.length < 3) {
        ctx.reply('لطفاً اطلاعات پروژه را به این شکل وارد کنید:\nتوضیحات\nبودجه\nمهلت');
        return;
    }
    const [description, budget, deadline] = message;
    ctx.reply('روش پرداخت را انتخاب کنید:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'تست پرداخت (موقت)', callback_data: 'gateway' }],
                [{ text: 'واسط ادمین', callback_data: 'admin' }],
            ],
        },
    });
    ctx.session = { telegramId, description, budget, deadline };
};
exports.projectHandler = projectHandler;
const paymentMethodHandler = async (ctx) => {
    const paymentMethod = ctx.callbackQuery?.data;
    const { telegramId, description, budget, deadline } = ctx.session || {};
    if (!telegramId || !description || !budget || !deadline) {
        ctx.reply('خطا در اطلاعات پروژه.');
        return;
    }
    try {
        await container_1.registerProject.execute(telegramId, description, budget, deadline, paymentMethod, ctx.telegram);
        ctx.reply('پردازش پروژه انجام شد.');
    }
    catch (error) {
        ctx.reply(error.message);
    }
};
exports.paymentMethodHandler = paymentMethodHandler;
