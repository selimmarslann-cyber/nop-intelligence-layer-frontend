// Utility functions for referral system
import { prisma } from "../db.js";

/**
 * Generate a unique referral code for a user
 * Format: 8 characters, alphanumeric, uppercase
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars like 0, O, I, 1
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Ensure a unique referral code for a user
 */
export async function ensureReferralCode(userId: number): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) {
    return user.referralCode;
  }

  // Generate a unique code
  let code: string;
  let exists = true;
  while (exists) {
    code = generateReferralCode();
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!existing) {
      exists = false;
    }
  }

  // Update user with referral code
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code! },
  });

  return code!;
}

/**
 * Process referral when a new user signs up with a referral code
 */
export async function processReferral(
  newUserId: number,
  referralCode: string
): Promise<{ success: boolean; referrerId?: number; error?: string }> {
  try {
    // Find referrer by code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
      select: { id: true, address: true },
    });

    if (!referrer) {
      return { success: false, error: "Invalid referral code" };
    }

    // Check if user is trying to refer themselves
    const newUser = await prisma.user.findUnique({
      where: { id: newUserId },
      select: { address: true },
    });

    if (newUser?.address.toLowerCase() === referrer.address.toLowerCase()) {
      return { success: false, error: "Cannot refer yourself" };
    }

    // Check if user was already referred
    const existingUser = await prisma.user.findUnique({
      where: { id: newUserId },
      select: { referredBy: true },
    });

    if (existingUser?.referredBy) {
      return { success: false, error: "User already referred" };
    }

    // Update new user with referrer
    await prisma.user.update({
      where: { id: newUserId },
      data: { referredBy: referrer.id },
    });

    // Award referral rewards (both users get 5,000 NOP)
    // New user gets reward
    await prisma.user.update({
      where: { id: newUserId },
      data: {
        balance: { increment: 5000n },
        referralRewardClaimed: true,
      },
    });

    // Referrer gets reward (if they haven't claimed yet - for now, always award)
    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        balance: { increment: 5000n },
      },
    });

    console.log(`[REFERRAL] User ${newUser?.address} referred by ${referrer.address} (+5,000 NOP each)`);

    return { success: true, referrerId: referrer.id };
  } catch (error: any) {
    console.error("Referral processing error:", error);
    return { success: false, error: error.message || "Failed to process referral" };
  }
}

