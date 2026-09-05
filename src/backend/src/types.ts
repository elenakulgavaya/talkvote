export interface Talk {
  id: string;
  title: string;
  speaker: string;
  abstract: string;
  track: "frontend" | "backend" | "qa" | "devops";
  level: "beginner" | "intermediate" | "advanced";
  status: "pending" | "approved" | "rejected";
  votes: number;
  createdAt: string;
}

export type CreateTalkInput = Omit<Talk, "id" | "status" | "votes" | "createdAt">;
export type UpdateStatusInput = { status: "approved" | "rejected" };
