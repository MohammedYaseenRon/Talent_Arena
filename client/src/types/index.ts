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

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type ChallengeType = "FRONTEND" | "BACKEND" | "FULLSTACK";

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