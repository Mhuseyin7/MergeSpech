import { Queue } from "bullmq";
import { env } from "./env";
export const ANALYSIS_QUEUE="analysis";
export type AnalysisJob={runId:string;installationId:string;repository:string;pullNumber:number;sha:string};
let queue:Queue<AnalysisJob>|undefined;
export function analysisQueue(){if(!env.REDIS_URL)throw new Error("REDIS_URL is required to enqueue analysis");return queue??=new Queue<AnalysisJob>(ANALYSIS_QUEUE,{connection:{url:env.REDIS_URL},defaultJobOptions:{attempts:3,backoff:{type:"exponential",delay:1_000},removeOnComplete:500,removeOnFail:1000}})}
