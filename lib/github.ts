import { App } from "@octokit/app";
import { env } from "./env";
export async function installationToken(installationId:string){if(!env.GITHUB_APP_ID||!env.GITHUB_APP_PRIVATE_KEY)throw new Error("GitHub App credentials are not configured");const app=new App({appId:env.GITHUB_APP_ID,privateKey:env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g,"\n")});const octokit=await app.getInstallationOctokit(Number(installationId));const result=await octokit.request("GET /installation/repositories");return {octokit,repositories:result.data.repositories}}
