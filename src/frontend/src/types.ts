export interface Talk {
  id: string;
  title: string;
  speakerName: string;
  abstract: string;
  track: "frontend" | "backend" | "qa" | "devops";
  level: "beginner" | "intermediate" | "advanced";
  status: "submitted" | "approved" | "rejected";
  votes: number;
  createdAt: string;
}

export type CreateTalkInput = Omit<Talk, "id" | "status" | "votes" | "createdAt">;

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
