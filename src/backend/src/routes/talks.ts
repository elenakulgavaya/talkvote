import { Router } from "express";
import { z } from "zod";
import {
  getAllTalks,
  getTalkById,
  createTalk,
  castVote,
  updateTalkStatus,
} from "../data/store.js";
import { talkSchema, statusSchema, validateBody } from "../middleware/validate.js";
import type { Talk } from "../types.js";

const router = Router();

const querySchema = z.object({
  track: z.enum(["frontend", "backend", "qa", "devops"]).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  sort: z.enum(["votes", "createdAt"]).optional(),
});

router.get("/", (req, res): void => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { track, level, status, sort } = parsed.data;
  let result: Talk[] = getAllTalks();

  if (track) result = result.filter((t) => t.track === track);
  if (level) result = result.filter((t) => t.level === level);
  if (status) result = result.filter((t) => t.status === status);

  if (sort === "votes") {
    result = [...result].sort((a, b) => b.votes - a.votes);
  } else {
    result = [...result].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res.json(result.map(({ votes, ...rest }) => rest));
});

router.get("/:id", (req, res): void => {
  const talk = getTalkById(req.params.id);
  if (!talk) {
    res.status(404).json({ error: "Talk not found" });
    return;
  }
  res.json(talk);
});

router.post("/", validateBody(talkSchema), (req, res): void => {
  const talk = createTalk(req.body);
  res.status(201).json(talk);
});

router.post("/:id/vote", (req, res): void => {
  const voterId = req.headers["x-voter-id"];
  if (!voterId || typeof voterId !== "string") {
    res.status(400).json({ error: "X-Voter-Id header is required" });
    return;
  }

  const talk = getTalkById(req.params.id);
  if (!talk) {
    res.status(404).json({ error: "Talk not found" });
    return;
  }

  const { talk: updated, alreadyVoted } = castVote(req.params.id, voterId);
  if (alreadyVoted) {
    res.status(409).json({ error: "Already voted for this talk" });
    return;
  }

  res.json(updated);
});

router.patch("/:id/status", validateBody(statusSchema), (req, res): void => {
  const updated = updateTalkStatus(req.params.id, req.body.status);
  if (!updated) {
    res.status(404).json({ error: "Talk not found" });
    return;
  }
  res.json(updated);
});

export default router;
