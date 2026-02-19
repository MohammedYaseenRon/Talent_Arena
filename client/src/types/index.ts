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