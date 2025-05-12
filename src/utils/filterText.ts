// src/utils/filterText.ts
import { prohibitedWords } from './prohibitedWords';

export const containsProhibitedWords = (input: string): boolean => {
    if (!input) return false;

    const normalizedInput = input
        .toLowerCase()
        .replace(/[\s\-_‌.,:;!?0-9]/g, '') // حذف فاصله، نیم‌فاصله، علائم و اعداد
        .replace(/[^\u0600-\u06FFa-z]/g, ''); // فقط حروف فارسی و انگلیسی نگه می‌دارد

    return prohibitedWords.some((word) => {
        const normalizedWord = word
            .toLowerCase()
            .replace(/[\s\-_‌.,:;!?0-9]/g, '')
            .replace(/[^\u0600-\u06FFa-z]/g, '');

        const pattern = new RegExp(normalizedWord.split('').join('.*'), 'i'); // تطبیق با فاصله یا علائم بین حروف
        return pattern.test(normalizedInput);
    });
};
