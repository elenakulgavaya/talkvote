import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

// Reset in-memory store between tests by re-importing a fresh module each time.
// Since vitest reuses modules, we work around it by mocking the store.
vi.mock("../data/store.js", async () => {
  const { v4: uuid } = await import("uuid");
  const talks: any[] = [
    {
      id: "talk-1",
      title: "Test Talk",
      speaker: "Speaker",
      abstract: "Abstract",
      track: "qa",
      level: "beginner",
      status: "submitted",
      votes: 0,
      createdAt: new Date().toISOString(),
    },
  ];
  const voterLog = new Map<string, Set<string>>();

  return {
    getAllTalks: () => talks,
    getTalkById: (id: string) => talks.find((t) => t.id === id),
    createTalk: (input: any) => {
      const talk = { id: uuid(), ...input, status: "submitted", votes: 0, createdAt: new Date().toISOString() };
      talks.push(talk);
      return talk;
    },
    castVote: (talkId: string, voterId: string) => {
      const talk = talks.find((t) => t.id === talkId);
      if (!talk) return { talk: undefined, alreadyVoted: false };
      if (!voterLog.has(talkId)) voterLog.set(talkId, new Set());
      const voters = voterLog.get(talkId)!;
      if (voters.has(voterId)) return { talk, alreadyVoted: true };
      voters.add(voterId);
      talk.votes += 1;
      return { talk, alreadyVoted: false };
    },
    updateTalkStatus: (talkId: string, status: string) => {
      const talk = talks.find((t) => t.id === talkId);
      if (!talk) return undefined;
      talk.status = status;
      return talk;
    },
  };
});

const app = createApp("http://localhost:5173");

describe("GET /api/talks", () => {
  it("returns list of talks", async () => {
    const res = await request(app).get("/api/talks");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("filters by track", async () => {
    const res = await request(app).get("/api/talks?track=qa");
    expect(res.status).toBe(200);
    res.body.forEach((t: any) => expect(t.track).toBe("qa"));
  });

  it("rejects invalid track filter", async () => {
    const res = await request(app).get("/api/talks?track=invalid");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/talks/:id", () => {
  it("returns talk by id", async () => {
    const res = await request(app).get("/api/talks/talk-1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("talk-1");
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/talks/nonexistent");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/talks", () => {
  it("creates a new talk", async () => {
    const payload = {
      title: "New Talk",
      speaker: "New Speaker",
      abstract: "Some abstract about the talk",
      track: "backend",
      level: "advanced",
    };
    const res = await request(app).post("/api/talks").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New Talk");
    expect(res.body.status).toBe("submitted");
    expect(res.body.votes).toBe(0);
    expect(res.body.id).toBeDefined();
  });

  it("rejects missing required fields", async () => {
    const res = await request(app).post("/api/talks").send({ title: "No speaker" });
    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });

  it("rejects invalid track value", async () => {
    const res = await request(app).post("/api/talks").send({
      title: "Talk",
      speaker: "Speaker",
      abstract: "Abstract",
      track: "mobile",
      level: "beginner",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/talks/:id/vote", () => {
  it("casts a vote and increments counter", async () => {
    const res = await request(app)
      .post("/api/talks/talk-1/vote")
      .set("X-Voter-Id", "voter-abc");
    expect(res.status).toBe(200);
    expect(res.body.votes).toBe(1);
  });

  it("returns 409 on duplicate vote", async () => {
    await request(app).post("/api/talks/talk-1/vote").set("X-Voter-Id", "voter-dup");
    const res = await request(app)
      .post("/api/talks/talk-1/vote")
      .set("X-Voter-Id", "voter-dup");
    expect(res.status).toBe(409);
  });

  it("returns 400 when X-Voter-Id header is missing", async () => {
    const res = await request(app).post("/api/talks/talk-1/vote");
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown talk", async () => {
    const res = await request(app)
      .post("/api/talks/no-such-talk/vote")
      .set("X-Voter-Id", "voter-xyz");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/talks/:id/status", () => {
  it("updates status to approved", async () => {
    const res = await request(app)
      .patch("/api/talks/talk-1/status")
      .send({ status: "approved" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
  });

  it("rejects invalid status", async () => {
    const res = await request(app)
      .patch("/api/talks/talk-1/status")
      .send({ status: "pending" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown talk", async () => {
    const res = await request(app)
      .patch("/api/talks/no-such-talk/status")
      .send({ status: "rejected" });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
