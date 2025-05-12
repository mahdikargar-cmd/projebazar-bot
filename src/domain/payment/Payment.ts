export type Payment = {
    id?: number;
    projectId: number; // ارتباط با پروژه (Foreign Key)
    telegramId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: 'gateway' | 'admin' | 'crypto' | 'other' | 'none'; // اضافه کردن 'none'
    transactionId?: string;
    createdAt: Date;
    updatedAt?: Date;
    description?: string;
};