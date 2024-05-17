import { db } from "@/lib/db";

export const getAccountByUserId = async (userId: string) => {
  try {
    return await db.account.findFirst({ where: { userId: userId } });
  } catch {
    return null;
  }
};
