/** Worker boundary: never execute repository code. It only consumes GitHub diffs. */
import { Worker } from "bullmq";
import { db } from "../lib/db";
import { env } from "../lib/env";
import { fingerprint } from "../lib/fingerprint";
import { installationToken } from "../lib/github";
import { ANALYSIS_QUEUE,type AnalysisJob } from "../lib/queue";
import { findingsFromDiff,type Candidate } from "../lib/diff-analysis";
export function normalizeFinding(candidate:Candidate){return {...candidate,fingerprint:fingerprint(candidate.ruleId,candidate.filePath,candidate.line,candidate.evidence),source:"deterministic" as const}}
async function analyze(job:AnalysisJob){await db.analysisRun.update({where:{id:job.runId},data:{status:"RUNNING",startedAt:new Date()}});try{const {octokit}=await installationToken(job.installationId);const [owner,repo]=job.repository.split("/");if(!owner||!repo)throw new Error("Invalid repository identity");const response=await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}",{owner,repo,pull_number:job.pullNumber,headers:{accept:"application/vnd.github.v3.diff"}});const diff=String(response.data);const candidates=findingsFromDiff(diff);await db.$transaction(async (tx:any)=>{for(const candidate of candidates){const value=normalizeFinding(candidate);await tx.finding.upsert({where:{runId_fingerprint:{runId:job.runId,fingerprint:value.fingerprint}},create:{runId:job.runId,fingerprint:value.fingerprint,ruleId:value.ruleId,severity:value.severity,filePath:value.filePath,line:value.line,evidence:{message:value.evidence},source:value.source},update:{}})}await tx.analysisRun.update({where:{id:job.runId},data:{status:"COMPLETE",completedAt:new Date()}})})}catch(cause){console.error(JSON.stringify({event:"analysis_failed",runId:job.runId,error:cause instanceof Error?cause.message:"unknown"}));await db.analysisRun.update({where:{id:job.runId},data:{status:"FAILED",errorCode:"ANALYSIS_FAILED",completedAt:new Date()}});throw cause}}
if(!env.REDIS_URL)throw new Error("REDIS_URL is required for worker");
const worker=new Worker<AnalysisJob>(ANALYSIS_QUEUE,async job=>analyze(job.data),{connection:{url:env.REDIS_URL},concurrency:2});
worker.on("ready",()=>console.info(JSON.stringify({service:"mergespech-worker",status:"ready",executionPolicy:"no-untrusted-code"})));
worker.on("failed",(job,error)=>console.error(JSON.stringify({event:"job_failed",jobId:job?.id,error:error.message})));
for(const signal of ["SIGINT","SIGTERM"] as const)process.on(signal,()=>worker.close().finally(()=>process.exit(0)));
