import { describe,it,expect } from "vitest";import{fingerprint}from"../lib/fingerprint";
describe("finding fingerprints",()=>it("is deterministic and input-sensitive",()=>{expect(fingerprint("r","a.ts",2,"x")).toBe(fingerprint("r","a.ts",2,"x"));expect(fingerprint("r","a.ts",2,"x")).not.toBe(fingerprint("r","a.ts",3,"x"))}));
