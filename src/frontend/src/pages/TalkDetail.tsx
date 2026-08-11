import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import type { Talk } from "../types";

function hasVoted(talkId: string): boolean {
  const key = `talkvote_voted_${talkId}`;
  return localStorage.getItem(key) === "1";
}

function markVoted(talkId: string) {
  localStorage.setItem(`talkvote_voted_${talkId}`, "1");
}

export function TalkDetail() {
  const { id } = useParams<{ id: string }>();
  const [talk, setTalk] = useState<Talk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getTalk(id)
      .then((t) => {
        setTalk(t);
        setVoted(hasVoted(id));
        document.title = `${t.title} · TalkVote`;
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleVote() {
    if (!id || !talk) return;
    setVoting(true);
    setVoteError(null);
    try {
      const updated = await api.vote(id);
      setTalk(updated);
      markVoted(id);
      setVoted(true);
    } catch (e: any) {
      setVoteError(e.message);
    } finally {
      setVoting(false);
    }
  }

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem", color: "#ef4444" }}>Error: {error}</div>;
  if (!talk) return null;

  const TRACK_COLORS: Record<string, string> = {
    frontend: "#3b82f6",
    backend: "#10b981",
    qa: "#f59e0b",
    devops: "#8b5cf6",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <Link to="/" style={{ fontSize: "0.875rem", color: "#3b82f6" }}>
        ← Back to list
      </Link>

      <article style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 12,
              background: TRACK_COLORS[talk.track] + "22",
              color: TRACK_COLORS[talk.track],
              textTransform: "uppercase",
            }}
          >
            {talk.track}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 12,
              background: "#f3f4f6",
              color: "#4b5563",
              textTransform: "capitalize",
            }}
          >
            {talk.level}
          </span>
        </div>

        <h1 style={{ margin: "0 0 0.5rem" }}>{talk.title}</h1>
        <p style={{ margin: "0 0 1.5rem", color: "#4b5563" }}>
          by <strong>{talk.speakerName}</strong>
        </p>

        <p style={{ lineHeight: 1.7, color: "#374151" }}>{talk.abstract}</p>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "1.5rem",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>👍</span>
          <span data-testid="vote-count" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {talk.votes}
          </span>
          <span style={{ color: "#6b7280" }}>votes</span>

          <button
            onClick={handleVote}
            disabled={voted || voting}
            data-testid="vote-button"
            style={{
              marginLeft: "auto",
              padding: "0.6rem 1.25rem",
              borderRadius: 6,
              border: "none",
              background: voted ? "#d1fae5" : "#3b82f6",
              color: voted ? "#065f46" : "#fff",
              fontWeight: 600,
              cursor: voted || voting ? "not-allowed" : "pointer",
              opacity: voting ? 0.7 : 1,
            }}
          >
            {voted ? "Already voted" : voting ? "Voting..." : "Vote for this talk"}
          </button>
        </div>

        {voteError && (
          <p style={{ color: "#ef4444", marginTop: "0.5rem" }}>{voteError}</p>
        )}
      </article>
    </div>
  );
}
