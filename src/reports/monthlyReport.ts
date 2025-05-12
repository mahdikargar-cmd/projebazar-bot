import { CustomContext } from '../types/telegraf';
import { Payment } from '../domain/payment/Payment';
import {paymentRepo} from "../domain/payment/IPaymentRepository";

export const generateMonthlyReport = async (year: number, month: number) => {
    try {
        const payments: Payment[] = await paymentRepo.getPaymentsByMonth(year, month);
        const totalAmount = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
        const completedPayments = payments.filter((p: Payment) => p.status === 'completed').length;
        const failedPayments = payments.filter((p: Payment) => p.status === 'failed').length;

        return {
            year,
            month,
            totalTransactions: payments.length,
            totalAmount,
            completedPayments,
            failedPayments,
            details: payments.map((p: Payment) => ({
                projectId: p.projectId,
                telegramId: p.telegramId,
                amount: p.amount,
                status: p.status,
                createdAt: p.createdAt,
            })),
        };
    } catch (error: any) {
        console.error(`Error generating report: ${error.message}`);
        throw new Error('Failed to generate report');
    }
};

// استفاده در یک handler
export const reportHandler = async (ctx: CustomContext) => {
    try {
        const report = await generateMonthlyReport(2025, 5); // مثال برای مه 1404
        ctx.reply(
            `📊 گزارش تراکنش‌های ${report.month}/${report.year}:\n` +
            `تعداد تراکنش‌ها: ${report.totalTransactions}\n` +
            `مجموع مبلغ: ${report.totalAmount} تومان\n` +
            `تراکنش‌های موفق: ${report.completedPayments}\n` +
            `تراکنش‌های ناموفق: ${report.failedPayments}`,
            { parse_mode: 'MarkdownV2' }
        );
    } catch (error: any) {
        ctx.reply('⚠️ خطا در تولید گزارش.', { parse_mode: 'MarkdownV2' });
    }
};