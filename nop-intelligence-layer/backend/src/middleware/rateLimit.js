// src/middleware/rateLimit.js
import rateLimit from "@fastify/rate-limit";
/**
 * Apply rate limiting to write endpoints (POST, PUT, DELETE, PATCH)
 * Limits: 100 requests per 15 minutes per IP
 */
export async function applyRateLimit(app) {
    await app.register(rateLimit, {
        global: false, // Don't apply globally
        max: 100, // 100 requests
        timeWindow: 15 * 60 * 1000, // 15 minutes
        skipOnError: false,
    });
}
/**
 * Rate limit configuration for write endpoints
 */
export const writeEndpointRateLimit = {
    max: 100,
    timeWindow: 15 * 60 * 1000, // 15 minutes
};

