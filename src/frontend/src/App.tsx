import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { TalksList } from "./pages/TalksList";
import { TalkDetail } from "./pages/TalkDetail";
import { SubmitTalk } from "./pages/SubmitTalk";
import { Admin } from "./pages/Admin";

export default function App() {
  return (
    <HashRouter>
      <nav
        style={{
          borderBottom: "1px solid #e5e7eb",
          padding: "0.75rem 1rem",
          display: "flex",
          gap: "1.5rem",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ fontWeight: 700, color: "#111827", textDecoration: "none" }}>
          TalkVote
        </Link>
        <Link to="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>
          Talks
        </Link>
        <Link to="/submit" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>
          Submit
        </Link>
        <Link to="/admin" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem", marginLeft: "auto" }}>
          Admin
        </Link>
      </nav>

      <main style={{ minHeight: "calc(100vh - 50px)", background: "#f9fafb" }}>
        <Routes>
          <Route path="/" element={<TalksList />} />
          <Route path="/talks/:id" element={<TalkDetail />} />
          <Route path="/submit" element={<SubmitTalk />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
