"use server";

import * as z from 'zod';
import {db} from "@/lib/db"
import bcrypt from "bcryptjs";
import {RegisterSchema} from "@/schemas";
import {getUserByEmail} from "@/data/user";

export const register = async (values : z.infer<typeof RegisterSchema> ) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if(!validatedFields) {
        return { error: "Invalid Fields!" }
    }

    // @ts-ignore
    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password,10)

    const existingUser = await getUserByEmail(email);

    if(existingUser) {
        return { error: "Email already in use." }
    }

    await db.user.create({
        data:{
            name,
            email,
            password: hashedPassword
        }
    })

    // Send Verfication Token Email

    return { success: "User created" }
}