"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import {
  generateVerificationToken,
  generateTwoFactorToken,
} from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { getTwoFactorAuthenticationTokenByEmail } from "@/data/TwofactorAuthenticationToken";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/TwoFactorConfirmation";
import { TypeOf, undefined } from "zod";

export const login = async (
  values: TypeOf<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  // Validates the data coming from the login form with LoginSchema and stores the validated data in ValidatedFields constant.
  const validatedFields = LoginSchema.safeParse(values);

  // If validation of the data fails, it returns the function with an error.
  if (!validatedFields.success) {
    return { error: "Invalid Fields!" };
  }

  // email, password, and name are extracted from validated data.
  const { email, password, code } = validatedFields.data;
  // Find if user already exists in database using email
  const existingUser = await getUserByEmail(email);

  // If user, user email or user password is not present in the database, we return with an error.
  // We also look for password because this function logins with credential provider,
  // If the has an oauth login and tries for credential, he will not be able to sign in and will return an error.
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email doest not exist!" };
  }

  // Checks if the email entered by the user is verified or not, if the entered email is not verified we generate a
  // verification token with the email we found in the data upon looking for existing user with the email entered by the user at the time of login.
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    // We send verification email with generated token and email provided by the user.
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    // returns success message.
    return { success: "Confirmation email sent!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorAuthenticationTokenByEmail(
        existingUser.email,
      );
      if (!twoFactorToken)
        return { error: "Invalid TwoFactor Authentication Token!" };
      if (twoFactorToken.token !== code)
        return { error: "Invalid TwoFactor Token!" };

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { error: "Code Expired" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  // try and catch block for sign in with credentials.
  try {
    // sign in with credentials with email, password and redirect parameters, redirectTo is used to redirect the user
    // to some specific webpage when logged in with providers.
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    // Catches errors and checks if they are instance of AuthError, if the error is CredentialSignin (credentials entered by the use are invalid)
    // we return error otherwise return a default error message.
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }

    // throw error is a requirement to end the catch block in the server action.
    throw error;
  }
};

// Sign in with providers function, takes redirectTo as a parameter.
export const providerSignIn = async (provider: "google" | "github") => {
  await signIn(provider, {
    redirectTo: DEFAULT_LOGIN_REDIRECT,
  });
};
