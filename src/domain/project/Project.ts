export type Project = {
    id?: number;
    telegramId: string;
    title: string;
    description: string;
    budget: string; // مثلاً "رایگان"، "توافقی" یا مبلغ مشخص
    deadline?: string;
    telegramUsername?: string | null;
    adType: 'free' | 'paid';
    amount?: number; // مبلغ آگهی (برای آگهی‌های پولی یا پین‌شده)
    isPinned?: boolean; // وضعیت پین شدن آگهی
    role: 'performer' | 'client' | 'hire';
};