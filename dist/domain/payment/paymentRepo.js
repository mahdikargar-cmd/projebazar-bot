"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepo = exports.PgPaymentRepository = void 0;
const pool_1 = require("../../infrastructure/db/pool");
class PgPaymentRepository {
    async createPayment(payment) {
        try {
            console.log(`Creating payment: ${JSON.stringify(payment, null, 2)}`);
            const result = await pool_1.pool.query(`INSERT INTO payments (project_id, telegram_id, amount, status, payment_method, transaction_id, created_at, updated_at, description)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING id`, [
                payment.projectId,
                payment.telegramId,
                payment.amount,
                payment.status,
                payment.paymentMethod,
                payment.transactionId || null,
                payment.createdAt,
                payment.updatedAt || null,
                payment.description || null,
            ]);
            const paymentId = result.rows[0].id;
            console.log(`Payment created successfully with ID: ${paymentId}`);
            return paymentId;
        }
        catch (error) {
            console.error(`Error in createPayment: ${error.message}`);
            throw error;
        }
    }
}
exports.PgPaymentRepository = PgPaymentRepository;
exports.paymentRepo = new PgPaymentRepository();
