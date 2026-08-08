import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import type { CreateTalkInput, ApiError } from "../types";

const INITIAL: CreateTalkInput = {
  title: "",
  speakerName: "",
  abstract: "",
  track: "frontend",
  level: "beginner",
};

export function SubmitTalk() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateTalkInput>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  function set(field: keyof CreateTalkInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerErrors({});
    setGlobalError(null);
    try {
      const talk = await api.createTalk(form);
      navigate(`/talks/${talk.id}`);
    } catch (err: any) {
      const body: ApiError = err.body || {};
      if (body.details) {
        setServerErrors(body.details);
      } else {
        setGlobalError(body.error || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    fontSize: "0.875rem",
    fontWeight: 500,
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <Link to="/" style={{ fontSize: "0.875rem", color: "#3b82f6" }}>
        ← Back to list
      </Link>

      <h1 style={{ marginBottom: "1.5rem" }}>Submit a Talk</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={labelStyle}>
          Title *
          <input
            style={fieldStyle}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            data-testid="input-title"
          />
          {serverErrors.title?.map((e) => <span key={e} style={{ color: "#ef4444", fontSize: "0.75rem" }}>{e}</span>)}
        </label>

        <label style={labelStyle}>
          Speaker Name *
          <input
            style={fieldStyle}
            value={form.speakerName}
            onChange={(e) => set("speakerName", e.target.value)}
            required
            data-testid="input-speakerName"
          />
          {serverErrors.speakerName?.map((e) => <span key={e} style={{ color: "#ef4444", fontSize: "0.75rem" }}>{e}</span>)}
        </label>

        <label style={labelStyle}>
          Abstract *
          <textarea
            style={{ ...fieldStyle, minHeight: 120, resize: "vertical" }}
            value={form.abstract}
            onChange={(e) => set("abstract", e.target.value)}
            required
            data-testid="input-abstract"
          />
          {serverErrors.abstract?.map((e) => <span key={e} style={{ color: "#ef4444", fontSize: "0.75rem" }}>{e}</span>)}
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <label style={labelStyle}>
            Track *
            <select
              style={fieldStyle}
              value={form.track}
              onChange={(e) => set("track", e.target.value)}
              data-testid="input-track"
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="qa">QA</option>
              <option value="devops">DevOps</option>
            </select>
          </label>

          <label style={labelStyle}>
            Level *
            <select
              style={fieldStyle}
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              data-testid="input-level"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>

        {globalError && (
          <p style={{ color: "#ef4444", margin: 0 }} data-testid="submit-error">
            {globalError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          data-testid="submit-button"
          style={{
            padding: "0.75rem",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: "1rem",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Submitting..." : "Submit Talk"}
        </button>
      </form>
    </div>
  );
}
