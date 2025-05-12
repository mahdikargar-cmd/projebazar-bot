"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdownV2 = void 0;
const escapeMarkdownV2 = (text) => {
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
};
exports.escapeMarkdownV2 = escapeMarkdownV2;
