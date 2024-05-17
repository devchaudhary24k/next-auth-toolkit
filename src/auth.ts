import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { getTwoFactorConfirmationByUserId } from "@/data/TwoFactorConfirmation";
import { getAccountByUserId } from "@/data/accounts";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      //  Allow Oauth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id as string);

      // Prevent sign in without email verification.
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id,
        );

        console.log({
          twoFactorConfirmation,
        });

        if (!twoFactorConfirmation) return false;

        //   Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },

    // Session function which is used to make changes in the current session which is valid for authenticated user.
    // Some of the values here are coming from jwt token.
    async session({ token, session }) {
      // if ID and session user both exists, pass ID from token to session user ID.
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      // If token comes with a role and there is active session user, pass the role to the session user role.
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
      }

      return session;
    },

    // We use this jwt to make changes in the token, which is then used by session function above to make changes in session.
    async jwt({ token }) {
      // token.sub is ID, and if ID doesn't exist the callback will exit.
      if (!token.sub) return null;
      const existingUser = await getUserById(token.sub);
      // If the user does not exist, simply return token.
      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      // If user do exists add a role field to the token and get value from existing user from the database.
      // Default role for every use is "USER".
      token.role = existingUser.role;
      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    },
  },
  // Prisma connection with auth.js is done with PrismaAdapter with db as an argument.
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },

  // auth.config.ts file expanded here because we need it to use PrismaAdapter.
  ...authConfig,
});
