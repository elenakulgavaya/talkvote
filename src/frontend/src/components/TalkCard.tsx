import { Link } from "react-router-dom";
import type { Talk } from "../types";

interface Props {
  talk: Talk;
}

const TRACK_COLORS: Record<string, string> = {
  frontend: "#3b82f6",
  backend: "#10b981",
  qa: "#f59e0b",
  devops: "#8b5cf6",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "#6b7280",
  approved: "#10b981",
  rejected: "#ef4444",
};

export function TalkCard({ talk }: Props) {
  return (
    <article
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 12,
            background: TRACK_COLORS[talk.track] + "22",
            color: TRACK_COLORS[talk.track],
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {talk.track}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 12,
            background: "#f3f4f6",
            color: "#4b5563",
            textTransform: "capitalize",
          }}
        >
          {talk.level}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 12,
            background: STATUS_COLORS[talk.status] + "22",
            color: STATUS_COLORS[talk.status],
            textTransform: "capitalize",
          }}
        >
          {talk.status}
        </span>
      </div>

      <Link
        to={`/talks/${talk.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{talk.title}</h2>
      </Link>

      <p style={{ margin: 0, fontSize: "0.875rem", color: "#4b5563" }}>
        by <strong>{talk.speakerName}</strong>
      </p>

      <p
        style={{
          margin: 0,
          fontSize: "0.875rem",
          color: "#6b7280",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {talk.abstract}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
        <span style={{ fontSize: "1.25rem" }}>👍</span>
        <span style={{ fontWeight: 700, fontSize: "1rem" }}>{talk.votes}</span>
        <Link
          to={`/talks/${talk.id}`}
          style={{ marginLeft: "auto", fontSize: "0.875rem", color: "#3b82f6" }}
        >
          View details →
        </Link>
      </div>
    </article>
  );
}
