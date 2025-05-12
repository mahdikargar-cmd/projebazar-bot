import { Payment } from './Payment';
import { pool } from '../../infrastructure/db/pool';

// تعریف رابط برای repository
export interface IPaymentRepository {
    createPayment(payment: Omit<Payment, 'id'>): Promise<number>;
    getPaymentsByMonth(year: number, month: number): Promise<Payment[]>;
}

export class PgPaymentRepository implements IPaymentRepository {
    async createPayment(payment: Omit<Payment, 'id'>): Promise<number> {
        try {
            console.log(`Creating payment: ${JSON.stringify(payment, null, 2)}`);
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
            const paymentId = result.rows[0].id;
            console.log(`Payment created successfully with ID: ${paymentId}`);
            return paymentId;
        } catch (error: any) {
            console.error(`Error in createPayment: ${error.message}`);
            throw error;
        }
    }

    async getPaymentsByMonth(year: number, month: number): Promise<Payment[]> {
        try {
            const result = await pool.query(
                `SELECT id, project_id, telegram_id, amount, status, payment_method, transaction_id, created_at, updated_at, description
                 FROM payments
                 WHERE EXTRACT(YEAR FROM created_at) = $1
                   AND EXTRACT(MONTH FROM created_at) = $2
                 ORDER BY created_at DESC`,
                [year, month]
            );
            const payments: Payment[] = result.rows.map(row => ({
                id: row.id,
                projectId: row.project_id,
                telegramId: row.telegram_id,
                amount: row.amount,
                status: row.status,
                paymentMethod: row.payment_method,
                transactionId: row.transaction_id || undefined,
                createdAt: row.created_at,
                updatedAt: row.updated_at || undefined,
                description: row.description || undefined,
            }));
            console.log(`Retrieved ${payments.length} payments for ${month}/${year}`);
            return payments;
        } catch (error: any) {
            console.error(`Error in getPaymentsByMonth: ${error.message}`);
            throw error;
        }
    }
}

export const paymentRepo = new PgPaymentRepository();

function tory() {
    throw new Error('Function not implemented.');
}
