export type Project = {
    id?: number;
    telegramId: string;
    title: string;
    description: string;
    budget: string;
    deadline?: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentMethod?: 'gateway' | 'admin';
    telegramUsername?: string | null; // اجازه دادن به null
    adType: 'free' | 'paid';
    amount?: number;
    isPinned?: boolean;
};