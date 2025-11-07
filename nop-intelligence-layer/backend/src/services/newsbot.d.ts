/**
 * RSS kaynaklarını çek, kısa TR tweet metni üret, DB'ye "bot post" olarak kaydet.
 */
export declare function fetchAndPostNews(): Promise<{
    saved: number;
    skipped: number;
}>;
/**
 * Eski import'larla uyum için alias.
 * news.ts tarafında yanlışlıkla getLatestNews import edilirse de çalışsın.
 */
export declare function getLatestNews(): Promise<{
    saved: number;
    skipped: number;
}>;
//# sourceMappingURL=newsbot.d.ts.map