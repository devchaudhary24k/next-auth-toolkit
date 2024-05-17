"use server";

import { db } from "@/lib/db";
import { getUserByEmail, getUserById } from "@/data/user";
import { getVerificaitonTokenByToken } from "@/data/VerificationToken";

// This function checks if the verification token in the verification token URL is valid or not and marks accounts as verified.
export const newVerification = async (token: string) => {
  // checks if the token from the verfication URL is present in the database and stores in the existingToken constant.
  const existingToken = await getVerificaitonTokenByToken(token);

  // if the token is not present in the database, we immediately return the function.
  if (!existingToken) return { error: "Token doesn't exist" };

  // checks if the token from the verification URL had expired or not.
  const hasExpired = new Date(existingToken.expires) < new Date();

  // if the token has been expired we simply return with and error message.
  if (hasExpired) return { error: "Token has expired" };

  // We look for the user in the database from the email associated with the token in the database which comes from
  // the verification URL and store it in the existingUser constant.
  const existingUser = await getUserByEmail(existingToken.email);

  // if the email does not exist in the database we return the function with an error message.
  if (!existingUser) return { error: "Email does not exist" };

  // We finally update the email verified fields in the user database with help of the existingUser id.
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      // We update email verified status and email in the email becuase it might be possible that the user has
      // changed the email and this is verification for his new email, so it is necessary to also update his
      // new email in the user database.
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  // In the end we delete the token from the database because we don't need token anymore after verifying the email.
  await db.verificaitonToken.delete({
    where: {
      id: existingToken.id,
    },
  });

  // return with a success message.
  return { success: "Email verified" };
};
