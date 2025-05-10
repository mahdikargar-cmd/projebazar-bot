export type Project = {
    id?: number;
    telegramId: string;
    description: string;
    budget: string;
    deadline: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentMethod?: 'gateway' | 'admin';
    telegramUsername?: string;
};