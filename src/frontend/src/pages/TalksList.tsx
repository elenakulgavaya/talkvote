import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { TalkCard } from "../components/TalkCard";
import type { Talk } from "../types";

const TRACKS = ["", "frontend", "backend", "qa", "devops"] as const;
const LEVELS = ["", "beginner", "intermediate", "advanced"] as const;
const STATUSES = ["", "submitted", "approved", "rejected"] as const;

export function TalksList() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("votes");

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getTalks({
        track: track || undefined,
        level: level || undefined,
        status: status || undefined,
        sort,
      })
      .then(setTalks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [track, level, status, sort]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>TalkVote</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>Vote for the talks you want to see at the conference</p>
        </div>
        <Link
          to="/submit"
          style={{
            background: "#3b82f6",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + Submit a talk
        </Link>
      </header>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem" }}>
          Track:
          <select value={track} onChange={(e) => setTrack(e.target.value)} data-testid="filter-track">
            {TRACKS.map((t) => (
              <option key={t} value={t}>{t || "All"}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem" }}>
          Level:
          <select value={level} onChange={(e) => setLevel(e.target.value)} data-testid="filter-level">
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l || "All"}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem" }}>
          Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="filter-status">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || "All"}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", marginLeft: "auto" }}>
          Sort by:
          <select value={sort} onChange={(e) => setSort(e.target.value)} data-testid="sort-select">
            <option value="votes">Votes</option>
            <option value="createdAt">Newest</option>
          </select>
        </label>
      </div>

      {loading && <p style={{ color: "#6b7280" }}>Loading talks...</p>}
      {error && <p style={{ color: "#ef4444" }}>Error: {error}</p>}

      {!loading && !error && talks.length === 0 && (
        <p style={{ color: "#6b7280" }}>No talks found. Try changing the filters or be the first to submit!</p>
      )}

      <div style={{ display: "grid", gap: "1rem" }}>
        {talks.map((talk) => (
          <TalkCard key={talk.id} talk={talk} />
        ))}
      </div>
    </div>
  );
}
