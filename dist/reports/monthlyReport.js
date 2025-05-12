"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportHandler = exports.generateMonthlyReport = void 0;
const IPaymentRepository_1 = require("../domain/payment/IPaymentRepository");
const generateMonthlyReport = async (year, month) => {
    try {
        const payments = await IPaymentRepository_1.paymentRepo.getPaymentsByMonth(year, month);
        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const completedPayments = payments.filter((p) => p.status === 'completed').length;
        const failedPayments = payments.filter((p) => p.status === 'failed').length;
        return {
            year,
            month,
            totalTransactions: payments.length,
            totalAmount,
            completedPayments,
            failedPayments,
            details: payments.map((p) => ({
                projectId: p.projectId,
                telegramId: p.telegramId,
                amount: p.amount,
                status: p.status,
                createdAt: p.createdAt,
            })),
        };
    }
    catch (error) {
        console.error(`Error generating report: ${error.message}`);
        throw new Error('Failed to generate report');
    }
};
exports.generateMonthlyReport = generateMonthlyReport;
// استفاده در یک handler
const reportHandler = async (ctx) => {
    try {
        const report = await (0, exports.generateMonthlyReport)(2025, 5); // مثال برای مه 1404
        ctx.reply(`📊 گزارش تراکنش‌های ${report.month}/${report.year}:\n` +
            `تعداد تراکنش‌ها: ${report.totalTransactions}\n` +
            `مجموع مبلغ: ${report.totalAmount} تومان\n` +
            `تراکنش‌های موفق: ${report.completedPayments}\n` +
            `تراکنش‌های ناموفق: ${report.failedPayments}`, { parse_mode: 'MarkdownV2' });
    }
    catch (error) {
        ctx.reply('⚠️ خطا در تولید گزارش.', { parse_mode: 'MarkdownV2' });
    }
};
exports.reportHandler = reportHandler;
