import { v4 as uuid } from "uuid";
import type { Talk } from "../types.js";

function createSeedData(): Talk[] {
  return [
  {
    id: uuid(),
    title: "From E2E to Contract Tests: A Practical Migration Path",
    speakerName: "Elena Kulgavaya",
    abstract:
      "Learn how to migrate from slow, brittle E2E tests to fast, precise contract tests without throwing away your existing test coverage. We'll walk through a real-world example using a React frontend and Node.js backend.",
    track: "qa",
    level: "intermediate",
    status: "approved",
    votes: 42,
    createdAt: new Date("2025-09-01T10:00:00Z").toISOString(),
  },
  {
    id: uuid(),
    title: "Building Resilient Microservices with Circuit Breakers",
    speakerName: "Alex Chen",
    abstract:
      "Deep dive into circuit breaker patterns, bulkheads, and timeouts. We'll implement a full resilience stack in Node.js and show how each pattern affects system behaviour under failure.",
    track: "backend",
    level: "advanced",
    status: "approved",
    votes: 38,
    createdAt: new Date("2025-09-02T11:30:00Z").toISOString(),
  },
  {
    id: uuid(),
    title: "React Query: Server State Done Right",
    speakerName: "Maria Gonzalez",
    abstract:
      "Stop fighting with useEffect and useState for async data. Discover how React Query transforms server-state management with automatic caching, background refetching, and optimistic updates.",
    track: "frontend",
    level: "intermediate",
    status: "approved",
    votes: 35,
    createdAt: new Date("2025-09-03T09:00:00Z").toISOString(),
  },
  {
    id: uuid(),
    title: "GitOps in Practice: Kubernetes Deployments Without the Chaos",
    speakerName: "Sam Patel",
    abstract:
      "GitOps sounds simple but getting it right in production is another story. This talk covers real pitfalls teams hit when adopting Flux or Argo CD and how to avoid them.",
    track: "devops",
    level: "intermediate",
    status: "submitted",
    votes: 27,
    createdAt: new Date("2025-09-04T14:00:00Z").toISOString(),
  },
  {
    id: uuid(),
    title: "TypeScript Generics: Beyond the Basics",
    speakerName: "Jordan Kim",
    abstract:
      "Conditional types, mapped types, template literal types — TypeScript's type system is surprisingly powerful. Walk away with patterns you can use in production today.",
    track: "frontend",
    level: "advanced",
    status: "submitted",
    votes: 24,
    createdAt: new Date("2025-09-05T10:00:00Z").toISOString(),
  },
  {
    id: uuid(),
    title: "Testing Strategy for Beginners: Where to Start",
    speakerName: "Priya Sharma",
    abstract:
      "New to testing? This beginner-friendly talk walks through the testing pyramid, when to write unit vs integration vs E2E tests, and the tools that make each level practical.",
    track: "qa",
    level: "beginner",
    status: "submitted",
    votes: 19,
    createdAt: new Date("2025-09-06T11:00:00Z").toISOString(),
  },
  {
    id: uuid(),
    title: "Zero-Downtime Deployments: Blue-Green and Canary in the Wild",
    speakerName: "Chris Müller",
    abstract:
      "Feature flags, traffic splitting, rollback strategies — deploying without downtime requires more than just two environments. This talk goes deep on the operational realities.",
    track: "devops",
    level: "advanced",
    status: "approved",
    votes: 31,
    createdAt: new Date("2025-09-07T13:00:00Z").toISOString(),
  },
  {
    id: uuid(),
    title: "Accessible Components: Making React UIs for Everyone",
    speakerName: "Aisha Okonkwo",
    abstract:
      "ARIA, focus management, keyboard navigation — accessibility is not an afterthought. Learn practical techniques to build React components that work for all users from the start.",
    track: "frontend",
    level: "beginner",
    status: "rejected",
    votes: 11,
    createdAt: new Date("2025-09-08T09:30:00Z").toISOString(),
  },
  ];
}

let talks: Talk[] = createSeedData();
const voterLog = new Map<string, Set<string>>(); // talkId -> Set<voterId>

export function getAllTalks(): Talk[] {
  return talks;
}

export function getTalkById(id: string): Talk | undefined {
  return talks.find((t) => t.id === id);
}

export function createTalk(input: Omit<Talk, "id" | "status" | "votes" | "createdAt">): Talk {
  const talk: Talk = {
    id: uuid(),
    ...input,
    status: "submitted",
    votes: 0,
    createdAt: new Date().toISOString(),
  };
  talks.push(talk);
  return talk;
}

export function castVote(talkId: string, voterId: string): { talk: Talk; alreadyVoted: boolean } {
  const talk = getTalkById(talkId);
  if (!talk) return { talk: talk as unknown as Talk, alreadyVoted: false };

  if (!voterLog.has(talkId)) voterLog.set(talkId, new Set());
  const voters = voterLog.get(talkId)!;

  if (voters.has(voterId)) return { talk, alreadyVoted: true };

  voters.add(voterId);
  talk.votes += 1;
  return { talk, alreadyVoted: false };
}

export function updateTalkStatus(talkId: string, status: "approved" | "rejected"): Talk | undefined {
  const talk = getTalkById(talkId);
  if (!talk) return undefined;
  talk.status = status;
  return talk;
}

export function clearStore(): void {
  talks.length = 0;
  voterLog.clear();
}
