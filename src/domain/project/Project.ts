export type Project = {
    id?: number;
    telegramId: string;
    description: string;
    budget: string;
    deadline: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentMethod?: 'gateway' | 'admin';
    telegramUsername?: string;
    adType: 'free' | 'paid'; // نوع آگهی: رایگان یا پولی
    amount?: number; // مبلغ آگهی پولی (در صورت نیاز)
};