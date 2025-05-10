export type User = {
    telegramId: string;
    fullName: string;
    phone?: string;
    coins: number;
    referredBy?: string; // telegramId کاربر دعوت‌کننده
};