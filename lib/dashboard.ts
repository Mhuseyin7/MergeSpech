import { db } from "./db";

export async function dashboardData() {
  try {
    const [openPullRequests, completedRuns, blockingFindings, recent] = await Promise.all([
      db.pullRequest.count({ where: { state: { in: ["open", "opened"] } } }),
      db.analysisRun.count({ where: { status: "COMPLETE", completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      db.finding.count({ where: { status: "OPEN", severity: { in: ["CRITICAL", "HIGH"] } } }),
      db.analysisRun.findMany({ orderBy: { startedAt: "desc" }, take: 8, include: { pullRequest: { include: { repository: true } } } })
    ]);
    return { openPullRequests, completedRuns, blockingFindings, recent };
  } catch {
    return { openPullRequests: 0, completedRuns: 0, blockingFindings: 0, recent: [] };
  }
}
