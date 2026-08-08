/**
 * Shared types for the Agent Control Plane — §29-36
 *
 * v3.0 — Added health evidence, review artifact, ARCHIVED state
 */

// ---------------------------------------------------------------------------
// Mission
// ---------------------------------------------------------------------------

export type MissionStatus =
  | 'pending'
  | 'claimed'
  | 'running'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'rolled_back'
  | 'archived';

export type MissionPriority = 'high' | 'medium' | 'low';

export interface Mission {
  id: string;
  type: string;
  priority: MissionPriority;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  files?: string[];
  deployApproved: boolean;
  destructiveOperationsAllowed: boolean;
  status: MissionStatus;
  claimedBy: string | null;
  claimedAt: string | null;
  leaseUntil: string | null;
  lastHeartbeat: string | null;
  baseSha: string;
  implementationSha: string | null;
  reportPath: string | null;
  lastError: string | null;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// State — v3.0 with health evidence
// ---------------------------------------------------------------------------

export type OrchestratorStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'REVIEWED' | 'ERROR';

export interface State {
  version: number;
  status: OrchestratorStatus;
  currentMission: string | null;
  lastCompletedMission: string | null;
  lastCompletedAt: string | null;
  totalMissionsCompleted: number;
  totalMissionsFailed: number;
  lastHealthCheck: string | null;
  heartbeatIntervalMs: number;
  workerId: string;
  baseSha: string;
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

export interface ExecutionResult {
  success: boolean;
  output: string;
  duration: string;
  baseSha: string;
  headSha: string;
  filesChanged: string[];
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface TestResult {
  command: string;
  status: 'passed' | 'failed' | 'skipped';
  exitCode?: number;
  duration?: string;
  output?: string;
}

export interface DeploymentInfo {
  attempted: boolean;
  status: 'success' | 'failed' | null;
  productionSha: string | null;
}

export interface SystemdEvidence {
  unitPath: string;
  enabled: boolean;
  active: boolean;
  actualExecStart: string;
  pointsToCanonical: boolean;
}

export interface MissionReport {
  missionId: string;
  status: 'success' | 'failed' | 'blocked' | 'rolled_back';
  startedAt: string;
  completedAt: string;
  baseSha: string;
  headSha: string;
  commits: string[];
  filesChanged: Array<{ file: string; action: string; linesChanged: number }>;
  tests: TestResult[];
  deployment: DeploymentInfo;
  productionHealth: boolean | null;
  blockers: string[];
  humanActions: string[];
  nextRecommendedAction: string;
  notes: string;
  systemdEvidence?: SystemdEvidence | null;
}

// ---------------------------------------------------------------------------
// Review Artifacts — v3.0
// ---------------------------------------------------------------------------

export interface ReviewArtifact {
  missionId: string;
  reviewer: string;
  reportPath: string;
  reportSha: string;
  implementationSha: string;
  verdict: 'approved' | 'rejected';
  findings: string[];
  reviewedAt: string;
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface OrchestratorOptions {
  pollIntervalMs: number;
  heartbeatMs: number;
  leaseMs: number;
  maxRetries: number;
  executor: 'opencode' | 'openclaw' | 'codex';
  dryRun: boolean;
}

export const DEFAULT_OPTIONS: OrchestratorOptions = {
  pollIntervalMs: 180_000,
  heartbeatMs: 60_000,
  leaseMs: 300_000,
  maxRetries: 3,
  executor: 'opencode',
  dryRun: false,
};
