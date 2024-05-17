import { db } from "@/lib/db";

export const getVerificaitonTokenByToken = async (token: string) => {
  try {
    const verificationToken = db.verificaitonToken.findUnique({
      where: { token },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

export const getVerificaitonTokenByEmail = async (email: string) => {
  try {
    const verificationToken = db.verificaitonToken.findFirst({
      where: { email },
    });

    return verificationToken;
  } catch {
    return null;
  }
};
