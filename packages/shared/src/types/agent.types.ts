export interface VerificationReport {
  artifactId: string;
  runId: string;
  verdict: 'pass' | 'fail' | 'warning';
  issues: VerificationIssue[];
  timestamp: Date;
}

export interface VerificationIssue {
  id: string;
  type: 'unsupported_claim' | 'missing_citation' | 'citation_drift' | 'invalid_mcq';
  severity: 'blocking' | 'warning';
  message: string;
  artifactPointer: string;
  suggestion?: string;
}

export interface QAReport {
  artifactId: string;
  runId: string;
  scores: QAScores;
  issues: QAIssue[];
  recommendations: string[];
  timestamp: Date;
}

export interface QAScores {
  grounding: number; // 0-100
  mcqValidity: number; // 0-100
  clarity?: number; // 0-100
  coverage?: number; // 0-100
  overall: number; // 0-100
}

export interface QAIssue {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  artifactPointer: string;
}
