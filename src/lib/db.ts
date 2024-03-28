import { PrismaClient } from "@prisma/client";
import {undefined} from "zod";


// We use this block of code because of Nextjs hot reload
declare global{
    var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV != "production") globalThis.prisma = db;