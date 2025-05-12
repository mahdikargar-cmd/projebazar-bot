// src/domain/payment/paymentRepo.ts
import { pool } from '../../infrastructure/db/pool';
import {Payment} from "../../domain/payment/Payment";

export class PgPaymentRepository {
    async createPayment(payment: Omit<Payment, 'id'>): Promise<number> {
        const result = await pool.query(
            `INSERT INTO payments (project_id, telegram_id, amount, status, payment_method, transaction_id, created_at, updated_at, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [
                payment.projectId,
                payment.telegramId,
                payment.amount,
                payment.status,
                payment.paymentMethod,
                payment.transactionId || null,
                payment.createdAt,
                payment.updatedAt || null,
                payment.description || null,
            ]
        );
        return result.rows[0].id;
    }
}

export const paymentRepo = new PgPaymentRepository();