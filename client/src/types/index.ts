interface FrontendChallengeDetails {
  taskDescription: string;
  submissionInstructions: string;
  features?: string;
  optionalRequirements?: string;
  apiDetails?: string;
  designReference?: string;
  techConstraints?: string;
  starterCode?: string;
  solutionTemplate?: string;
  allowedLanguages?: string[];
}

interface CreateChallenge {
  title: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  challengeType: "FRONTEND" | "BACKEND" | "DSA" | "SYSTEM_DESIGN";
  frontendChallenge?: FrontendChallengeDetails;
}



export interface ChallengeContent {
  taskDescription: string;
  features: string;
  optionalRequirements: string;
  apiDetails: string;
  designImages: string[] | null;
  submissionInstructions: string;
  techConstraints: string;
  starterCode: string;
  allowedLanguages: string[];
}



export interface AttemptChallenge {
  challengeId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  challengeType: ChallengeType;
  content: ChallengeContent;
}

export interface AttemptSession {
  sessionId: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface AttemptData {
  challenge: AttemptChallenge;
  session: AttemptSession;
}


export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type ChallengeType = "FRONTEND" | "BACKEND" | "DSA" | "SYSTEM_DESIGN";
export type SessionStatus = "SCHEDULED" | "LIVE" | "ENDED";
export type UIStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "LIVE" | "ENDED";


export interface LiveChallenge {
  challengeId: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  challengeType: ChallengeType;
  sessionId: string;
  startTime: string;
  endTime: string;
  participantCount?: number;
  submittedCount?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Breakdown {
  requirements: number;
  codeQuality: number;
  features: number;
  optionalFeatures: number;
}

export interface Submission {
  userId: string;
  name: string;
  email: string;
  startedAt: string | null;
  finishedAt: string | null;
  submissionId: string | null;
  submittedAt: string | null;
  autoSubmitted: boolean | null;
  aiScore: number | null;
  aiSummary: string | null;
  aiBreakdown: Breakdown | null;
  aiStrengths: string[] | null;
  aiImprovements: string[] | null;
  featuresCompleted: string[] | null;
  featuresMissing: string[] | null;
  evaluatedAt: string | null;
  status: "EVALUATED" | "PENDING" | "IN_PROGRESS" | "REGISTERED";
}

export interface SessionSubmissionsResponse {
  challengeTitle: string;
  sessionId: string;
  total: number;
  submissions: Submission[];
}

export type FilterType = "ALL" | Submission["status"];
export type SubmissionStatus = "EVALUATED" | "PENDING" | "IN_PROGRESS" | "REGISTERED";

export interface Participant {
  userId: string;
  name: string;
  email: string;
  startedAt: string | null;
  finishedAt: string | null;
  submissionId: string | null;
  submittedAt: string | null;
  autoSubmitted: boolean | null;
  aiScore: number | null;
  aiSummary: string | null;
  aiBreakdown: {
    requirements: number;
    codeQuality: number;
    features: number;
    optionalFeatures: number;
  } | null;
  aiStrengths: string[] | null;
  aiImprovements: string[] | null;
  featuresCompleted: string[] | null;
  featuresMissing: string[] | null;
  evaluatedAt: string | null;
  status: SubmissionStatus;
}

export interface ChallengeResult {
  challengeId: string;
  title: string;
  difficulty: Difficulty;
  challengeType: ChallengeType;
  sessionId: string;
  sessionStatus: SessionStatus;
  startTime: string;
  endTime: string;
  totalParticipants: number;
  totalSubmitted: number;
  avgScore: number | null;
  topScore: number | null;
  participants: Participant[];
}


export interface CandidateSubmission {
  submissionId: string;
  code: string;
  language: string;
  autoSubmitted: boolean;
  submittedAt: string;
  aiScore: number | null;
  aiSummary: string | null;
  aiBreakdown: Breakdown | null;
  aiStrengths: string[] | null;
  aiImprovements: string[] | null;
  featuresCompleted: string[] | null;
  featuresMissing: string[] | null;
  evaluatedAt: string | null;
  candidateName: string;
  candidateEmail: string;
  codeFiles: Record<string, string>;
}

export interface PageData {
  challengeTitle: string;
  submission: CandidateSubmission;
}