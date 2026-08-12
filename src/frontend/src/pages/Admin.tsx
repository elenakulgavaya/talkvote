import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Talk } from "../types";

export function Admin() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  function loadTalks() {
    setLoading(true);
    api
      .getTalks({ status: "submitted" })
      .then(setTalks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    document.title = "Admin · TalkVote";
    loadTalks();
  }, []);

  async function handleStatus(talkId: string, status: "approved" | "rejected") {
    setUpdating(talkId);
    try {
      await api.updateStatus(talkId, status);
      setTalks((prev) => prev.filter((t) => t.id !== talkId));
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Admin Panel</h1>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Review submitted talks and approve or reject them.
      </p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#ef4444" }}>Error: {error}</p>}

      {!loading && !error && talks.length === 0 && (
        <p style={{ color: "#6b7280" }}>No pending talks to review.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {talks.map((talk) => (
          <div
            key={talk.id}
            data-testid={`admin-talk-${talk.id}`}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "1rem",
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>{talk.title}</h2>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", color: "#4b5563" }}>
                  by <strong>{talk.speaker}</strong> · {talk.track} · {talk.level}
                </p>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>{talk.abstract}</p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button
                  onClick={() => handleStatus(talk.id, "approved")}
                  disabled={updating === talk.id}
                  data-testid={`approve-${talk.id}`}
                  style={{
                    padding: "0.4rem 0.9rem",
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatus(talk.id, "rejected")}
                  disabled={updating === talk.id}
                  data-testid={`reject-${talk.id}`}
                  style={{
                    padding: "0.4rem 0.9rem",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
