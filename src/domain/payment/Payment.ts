export type Payment = {
    id?: number;
    projectId: number;
    telegramId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: 'gateway' | 'admin' | 'crypto' | 'other' | 'none';
    transactionId?: string;
    createdAt: Date;
    updatedAt?: Date;
    description?: string;
};