// src/config.ts
// Varsayılan kurallar; .env ile override edebilirsin
export const MIN_WITHDRAW_POINTS = BigInt(process.env.MIN_WITHDRAW_POINTS || "50000"); // 50k puan
export const FEE_PERCENT_BPS = BigInt(process.env.FEE_PERCENT_BPS || "100"); // 100 bps = %1
export const FEE_FIXED_POINTS = BigInt(process.env.FEE_FIXED_POINTS || "0"); // sabit puan (istersen 100 yap)
export const DAILY_CAP_POINTS = BigInt(process.env.DAILY_CAP_POINTS || "1000000"); // günlük adres limiti (puan)
export const POINTS_PER_TOKEN = BigInt(process.env.POINTS_PER_TOKEN || "100"); // 100 puan = 1 token ör.
export const SCALE = BigInt(1e18); // rPT ölçeği
// ödül hızı: 50,000,000 token / 365 gün -> points'e çevirmek istersen (opsiyonel)
// Burada accrual mantığını sonra ekleyebiliriz. Şimdilik withdraw/preview/stake çalışsın.
//# sourceMappingURL=config.js.map