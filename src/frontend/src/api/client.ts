import type { Talk, CreateTalkInput } from "../types";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

function getVoterId(): string {
  let id = localStorage.getItem("talkvote_voter_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("talkvote_voter_id", id);
  }
  return id;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const body = await res.json();
  if (!res.ok) throw Object.assign(new Error(body.error || "Request failed"), { body, status: res.status });
  return body as T;
}

export const api = {
  getTalks(params?: { track?: string; level?: string; status?: string; sort?: string }): Promise<Talk[]> {
    const qs = new URLSearchParams();
    if (params?.track) qs.set("track", params.track);
    if (params?.level) qs.set("level", params.level);
    if (params?.status) qs.set("status", params.status);
    if (params?.sort) qs.set("sort", params.sort);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return request<Talk[]>(`/api/talks${query}`);
  },

  getTalk(id: string): Promise<Talk> {
    return request<Talk>(`/api/talks/${id}`);
  },

  createTalk(input: CreateTalkInput): Promise<Talk> {
    return request<Talk>("/api/talks", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  vote(talkId: string): Promise<Talk> {
    return request<Talk>(`/api/talks/${talkId}/vote`, {
      method: "POST",
      headers: { "X-Voter-Id": getVoterId() },
    });
  },

  updateStatus(talkId: string, status: "approved" | "rejected"): Promise<Talk> {
    return request<Talk>(`/api/talks/${talkId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
