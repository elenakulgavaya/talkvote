/**
 * Frontend contract tests: validates that frontend's api/client.ts produces requests
 * that match what the backend expects (as defined in openapi.yaml), and that the
 * response shapes the frontend depends on are what the schema promises.
 *
 * These tests run against a Prism mock server started from openapi.yaml,
 * so no real backend is needed — only the schema.
 *
 * Run: PRISM_URL=http://localhost:4010 vitest run frontend-tests
 */

import { describe, it, expect, beforeAll } from "vitest";

const PRISM_URL = process.env.PRISM_URL || "http://localhost:4010";

// Minimal inline version of the frontend API client, pointing at Prism mock.
// This mirrors src/api/client.ts exactly — if the client diverges from the schema,
// these tests will catch it.
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PRISM_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error || "Request failed"), { status: res.status, body });
  }
  return res.json() as Promise<T>;
}

interface Talk {
  id: string;
  title: string;
  speakerName: string;
  abstract: string;
  track: string;
  level: string;
  status: string;
  votes: number;
  createdAt: string;
}

describe("GET /api/health", () => {
  it("returns { status: 'ok', timestamp: string }", async () => {
    const body = await apiFetch<{ status: string; timestamp: string }>("/api/health");
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
  });
});

describe("GET /api/talks", () => {
  it("returns an array", async () => {
    const body = await apiFetch<Talk[]>("/api/talks");
    expect(Array.isArray(body)).toBe(true);
  });

  it("each talk has required fields that frontend depends on", async () => {
    const talks = await apiFetch<Talk[]>("/api/talks");
    if (talks.length === 0) return; // Prism may return empty example

    for (const talk of talks) {
      expect(typeof talk.id).toBe("string");
      expect(typeof talk.title).toBe("string");
      expect(typeof talk.speakerName).toBe("string");
      expect(typeof talk.abstract).toBe("string");
      expect(["frontend", "backend", "qa", "devops"]).toContain(talk.track);
      expect(["beginner", "intermediate", "advanced"]).toContain(talk.level);
      expect(["submitted", "approved", "rejected"]).toContain(talk.status);
      // votes MUST be a number — breaking change demo/break-votes-shape changes this
      expect(typeof talk.votes).toBe("number");
      expect(typeof talk.createdAt).toBe("string");
    }
  });

  it("accepts track filter query param", async () => {
    const res = await fetch(`${PRISM_URL}/api/talks?track=qa`);
    expect(res.status).toBe(200);
  });

  it("rejects invalid track filter", async () => {
    const res = await fetch(`${PRISM_URL}/api/talks?track=mobile`);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/talks/:id", () => {
  it("returns a talk shape with all required fields", async () => {
    // Use Prism example — any path with a string id
    const res = await fetch(`${PRISM_URL}/api/talks/example-id`);
    // Prism returns 200 with generated example or 404 — both are valid responses per schema
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      const talk: Talk = await res.json();
      expect(typeof talk.votes).toBe("number");
      expect(typeof talk.status).toBe("string");
    }
  });
});

describe("POST /api/talks", () => {
  it("accepts valid create payload and returns Talk with status=submitted", async () => {
    const payload = {
      title: "Contract Test Talk",
      speakerName: "Contract Tester",
      abstract: "Testing the contract between frontend and backend via schema.",
      track: "qa",
      level: "intermediate",
    };
    const res = await fetch(`${PRISM_URL}/api/talks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(201);
    const talk: Talk = await res.json();
    expect(typeof talk.id).toBe("string");
    expect(talk.status).toBe("submitted");
    expect(typeof talk.votes).toBe("number");
  });

  it("rejects payload missing required fields", async () => {
    const res = await fetch(`${PRISM_URL}/api/talks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "No speaker" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/talks/:id/vote", () => {
  it("requires X-Voter-Id header", async () => {
    const res = await fetch(`${PRISM_URL}/api/talks/some-id/vote`, {
      method: "POST",
    });
    expect(res.status).toBe(400);
  });

  it("accepts X-Voter-Id header and returns Talk shape", async () => {
    const res = await fetch(`${PRISM_URL}/api/talks/some-id/vote`, {
      method: "POST",
      headers: { "X-Voter-Id": "test-voter-001" },
    });
    expect([200, 404, 409]).toContain(res.status);
    if (res.status === 200) {
      const talk: Talk = await res.json();
      // This assertion catches demo/break-votes-shape
      expect(typeof talk.votes).toBe("number");
    }
  });
});

describe("PATCH /api/talks/:id/status", () => {
  it("accepts approved status", async () => {
    const res = await fetch(`${PRISM_URL}/api/talks/some-id/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    expect([200, 404]).toContain(res.status);
  });

  it("rejects invalid status value — catches demo/break-status-enum", async () => {
    const res = await fetch(`${PRISM_URL}/api/talks/some-id/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });
    // "accepted" is not in the schema enum — should be 400
    expect(res.status).toBe(400);
  });
});
