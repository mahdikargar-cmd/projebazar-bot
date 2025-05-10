"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const container_1 = require("../../shared/container");
const adWizard = new telegraf_1.Scenes.WizardScene('AD_WIZARD', 
// مرحله 1: انتخاب نوع آگهی
async (ctx) => {
    ctx.wizard.state.adData = {}; // حالا TS می‌فهمه adData چیه
    await ctx.reply('▫️ ابتدا نوع آگهی خود را از طریق یکی از گزینه‌های زیر انتخاب کنید:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔘 درخواست‌کننده', callback_data: 'requester' }],
                [{ text: '🔘 انجام‌دهنده', callback_data: 'provider' }],
            ],
        },
    });
    return ctx.wizard.next();
}, 
// مرحله 2: دریافت نوع
async (ctx) => {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        ctx.wizard.state.adData.ad_type = ctx.callbackQuery.data;
        await ctx.reply('▫️ لطفا متن آگهی خود را ارسال کنید:\n\n💡 مثال: کمک در حل چند سوال ریاضی مهندسی');
        return ctx.wizard.next();
    }
    await ctx.reply('لطفاً نوع آگهی را انتخاب کنید.');
}, 
// مرحله 3: دریافت توضیحات
async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
        ctx.wizard.state.adData.description = ctx.message.text;
        await ctx.reply('▫️ لطفا آیدی یا شماره تماسی که می‌خواهید در آگهی درج شود را وارد کنید:\n\nمثال 1: @Daneshjoo_Com\nمثال 2: 09120000000');
        return ctx.wizard.next();
    }
    await ctx.reply('لطفاً متن آگهی را وارد کنید.');
}, 
// مرحله 4: دریافت اطلاعات تماس
async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
        ctx.wizard.state.adData.contact_info = ctx.message.text;
        await ctx.reply('▫️ لطفا مبلغ مورد نظر برای انجام این کار را وارد کنید:\n\nمثال: توافقی یا 500,000 تومان');
        return ctx.wizard.next();
    }
    await ctx.reply('لطفاً آیدی یا شماره تماس را وارد کنید.');
}, 
// مرحله 5: دریافت بودجه و پیش‌نمایش
async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
        ctx.wizard.state.adData.budget = ctx.message.text;
        ctx.wizard.state.adData.deadline = 'توافقی';
        const { description, budget, contact_info, ad_type } = ctx.wizard.state.adData;
        if (!description || !budget || !contact_info || !ad_type) {
            await ctx.reply('اطلاعات آگهی ناقص است. لطفاً از ابتدا شروع کنید.');
            return ctx.scene.leave();
        }
        const adTypeText = ad_type === 'requester' ? 'درخواست‌کننده' : 'انجام‌دهنده';
        const preview = `✅ پیش‌نمایش آگهی شما:\n\n▫️ نوع آگهی: ${adTypeText}\n\n📝 ${description}\n\n💳 قیمت: ${budget}\n\n👤 ${contact_info}\n\n➖➖➖➖➖🔸\n\nآیا این آگهی را تأیید می‌کنید؟`;
        await ctx.reply(preview, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✅ تأیید', callback_data: 'confirm' }],
                    [{ text: '❌ لغو', callback_data: 'cancel' }],
                ],
            },
        });
        return ctx.wizard.next();
    }
    await ctx.reply('لطفاً مبلغ را وارد کنید.');
}, 
// مرحله 6: تأیید نهایی و ثبت
async (ctx) => {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        if (ctx.callbackQuery.data === 'cancel') {
            await ctx.reply('ثبت آگهی لغو شد.');
            return ctx.scene.leave();
        }
        const { description, budget, deadline, contact_info, ad_type } = ctx.wizard.state.adData;
        try {
            const { project_id, message } = await container_1.registerProject.execute(String(ctx.from?.id), description, budget, deadline, contact_info, ad_type, 'gateway', ctx.telegram);
            const adTypeText = ad_type === 'requester' ? 'درخواست‌کننده' : 'انجام‌دهنده';
            await ctx.reply(`✅ آگهی شما با موفقیت ثبت شد.\n▫️ نوع آگهی: ${adTypeText}\n▫️ کد آگهی: ${project_id}\n\n${message}\n\n💳 اگر سکه کافی ندارید، هزینه ثبت آگهی 15,000 تومان است.`);
        }
        catch (err) {
            await ctx.reply(`خطا: ${err.message}`);
        }
        return ctx.scene.leave();
    }
    await ctx.reply('لطفاً تأیید یا لغو را انتخاب کنید.');
});
exports.default = adWizard;
