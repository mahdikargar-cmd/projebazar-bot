"use strict";
// src/repositories/paymentRepo.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepo = exports.PaymentRepository = void 0;
class PaymentRepository {
    async createPayment(payment) {
        const result = await this.collection.insertOne(payment);
        return result.insertedId; // یا شناسه تولیدشده
    }
    async getPaymentsByMonth(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        return this.collection.find({
            createdAt: { $gte: startDate, $lte: endDate },
        }).toArray();
    }
    async updatePaymentStatus(id, status) {
        await this.collection.updateOne({ id }, { $set: { status, updatedAt: new Date() } });
    }
}
exports.PaymentRepository = PaymentRepository;
exports.paymentRepo = new PaymentRepository();
