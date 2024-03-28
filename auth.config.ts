import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "@/schemas";
import {getUserByEmail} from "@/data/user";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export default {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                const ValidatedFields = LoginSchema.safeParse(credentials);

                if (ValidatedFields.success) {
                    const { email, password } = ValidatedFields.data;

                    const user = await getUserByEmail(email);
                    if (!user || !user.password) return null;

                    const passwordMatch = await bcrypt.compare(
                        password,
                        user.password,
                    );

                    if (passwordMatch) return user;
                }

                return null;
            }
        })
    ],
} satisfies NextAuthConfig;