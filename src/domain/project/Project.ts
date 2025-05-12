export type Project = {
    id?: number;
    telegramId: string;
    title: string;
    description: string;
    budget: string;
    deadline?: string;
    telegramUsername?: string | null;
    adType: 'free' | 'paid';
    amount?: number;
    isPinned?: boolean;
    role: 'performer' | 'client' | 'hire';
};