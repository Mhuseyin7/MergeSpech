import { createHash } from "node:crypto";
export function fingerprint(ruleId:string,filePath:string,line:number|undefined,evidence:string){return createHash("sha256").update(`${ruleId}\0${filePath}\0${line??0}\0${evidence}`).digest("hex")}
