import { PrismaClient } from "@prisma/client";
const globalForDb=globalThis as unknown as { prisma?:PrismaClient };
export const db=globalForDb.prisma??new PrismaClient({log:process.env.NODE_ENV==="development"?["warn","error"]:["error"]});
if(process.env.NODE_ENV!=="production")globalForDb.prisma=db;
