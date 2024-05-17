"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  // Validates the data coming from the register form with RegisterSchema and stores the validated data in ValidatedFields constant.
  const validatedFields = RegisterSchema.safeParse(values);

  // If validation of the data fails, it returns the function with an error.
  if (!validatedFields.success) {
    return { error: "Invalid Fields!" };
  }

  // email, password, and name are extracted from validated data.
  const { email, password, name } = validatedFields.data;
  // Use bcryptjs to encrypt the password with some salt and store the encrypted data in hashedPassword constant.
  const hashedPassword = await bcrypt.hash(password, 10);

  // Searched database for any entry associated with the email entered by the user in register form, if any user
  // already present in the database return the function with an error.
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: "Email already in use." };
  }

  // Created user in the user database with different fields which were extracted from validated data.
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // After creating the user in the database, generate a verification token and send the verification token to
  // the user through email through which the user can verify the email and can start using the application.
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Confirmation email sent!" };
};
