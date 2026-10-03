import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env";
export const SESSION_COOKIE="mergespech_session";
export const OAUTH_STATE_COOKIE="mergespech_oauth_state";
export const token=()=>randomBytes(32).toString("base64url");
export const hash=(value:string)=>createHash("sha256").update(`${env.SESSION_SECRET}:${value}`).digest("hex");
export function same(left:string,right:string){const a=Buffer.from(left),b=Buffer.from(right);return a.length===b.length&&timingSafeEqual(a,b)}
