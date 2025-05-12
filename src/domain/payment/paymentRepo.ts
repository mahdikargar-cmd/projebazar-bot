// src/repositories/paymentRepo.ts

import {Payment} from "./Payment";

export class PaymentRepository {
    private collection: any; // جایگزین با مدل MongoDB یا ORM

    async createPayment(payment: Omit<Payment, 'id'>): Promise<number> {
        const result = await this.collection.insertOne(payment);
        return result.insertedId; // یا شناسه تولیدشده
    }

    async getPaymentsByMonth(year: number, month: number): Promise<Payment[]> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        return this.collection.find({
            createdAt: { $gte: startDate, $lte: endDate },
        }).toArray();
    }

    async updatePaymentStatus(id: number, status: Payment['status']): Promise<void> {
        await this.collection.updateOne({ id }, { $set: { status, updatedAt: new Date() } });
    }
}

export const paymentRepo = new PaymentRepository();