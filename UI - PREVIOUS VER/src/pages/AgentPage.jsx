import GlobalStyles from "../components/dashboard/GlobalStyles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NAV = [
  { id: "dashboard", label: "Agent Dashboard", icon: "◈" },
  { id: "ivr",       label: "IVR",             icon: "⧖" },
  { id: "calls",     label: "Calls",            icon: "↗" },
];

function Sidebar({ active, setActive, onLogout }) {
  return (
    <aside style={{
      position: "fixed", left: 0, top: 0,
      height: "100vh", width: 240,
      background: "var(--bg2)",
      borderRight: "1px solid var(--bdr)",
      display: "flex", flexDirection: "column",
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "22px 18px 17px", borderBottom: "1px solid var(--bdr)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg, var(--pur), var(--acc))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0,
          }}>
            SR
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2, color: "var(--txt)" }}>
            SR<br />
            <span style={{ color: "var(--txt2)", fontWeight: 500 }}>Comsoft Ai</span>
          </span>
        </div>
      </div>

      {/* Agent badge */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--bdr)" }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "1px",
          textTransform: "uppercase", padding: "4px 12px", borderRadius: 20,
          background: "rgba(0,212,160,0.12)", color: "var(--grn)",
          border: "1px solid rgba(0,212,160,0.25)",
        }}>
          Agent
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 9, width: "100%",
                border: `1px solid ${isActive ? "var(--bdr2)" : "transparent"}`,
                background: isActive ? "var(--purl)" : "transparent",
                color: isActive ? "var(--pur2)" : "var(--txt2)",
                fontFamily: "var(--font-sans, 'Syne', sans-serif)",
                fontSize: 13.5, fontWeight: 500,
                cursor: "pointer", textAlign: "left",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--purl)";
                  e.currentTarget.style.color = "var(--txt)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--txt2)";
                }
              }}
            >
              <span style={{ width: 18, textAlign: "center", fontSize: 15, flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: "14px 10px", borderTop: "1px solid var(--bdr)" }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 9, width: "100%",
            border: "1px solid transparent",
            background: "transparent",
            color: "var(--red)",
            fontFamily: "var(--font-sans, 'Syne', sans-serif)",
            fontSize: 13.5, fontWeight: 500,
            cursor: "pointer", textAlign: "left",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,71,87,0.08)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ width: 18, textAlign: "center", fontSize: 15 }}>⎋</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function EmptyCard({ title, desc }) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--bdr)",
      borderRadius: 16, padding: 32,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", minHeight: 200,
      gap: 12,
    }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--txt)" }}>{title}</p>
      <p style={{ fontSize: 13, color: "var(--txt2)", maxWidth: 260, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function MainContent({ active }) {
  if (active === "dashboard") {
    return (
      <div className="fade-in">
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Agent Dashboard</h2>
        <p style={{ fontSize: 14, color: "var(--txt2)", marginBottom: 32 }}>Your personal overview.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <EmptyCard title="Total Calls"     desc="Your call stats will appear here." />
          <EmptyCard title="Active Sessions" desc="Live sessions will appear here." />
          <EmptyCard title="Performance"     desc="Your performance metrics will appear here." />
        </div>
      </div>
    );
  }

  if (active === "ivr") {
    return (
      <div className="fade-in">
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>IVR</h2>
        <p style={{ fontSize: 14, color: "var(--txt2)", marginBottom: 32 }}>Interactive Voice Response configuration.</p>
        <EmptyCard title="IVR Coming Soon" desc="IVR configuration and management will be available here." />
      </div>
    );
  }

  if (active === "calls") {
    return (
      <div className="fade-in">
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Calls</h2>
        <p style={{ fontSize: 14, color: "var(--txt2)", marginBottom: 32 }}>WebRTC powered calls.</p>
        <EmptyCard title="WebRTC Coming Soon" desc="Real-time voice calls via WebRTC will be integrated here." />
      </div>
    );
  }

  return null;
}

export default function AgentPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        <Sidebar active={active} setActive={setActive} onLogout={handleLogout} />
        <main style={{
          marginLeft: 240, flex: 1,
          padding: "38px 44px",
          animation: "fadeIn 0.2s ease",
        }}>
          <MainContent active={active} />
        </main>
      </div>
    </>
  );
}