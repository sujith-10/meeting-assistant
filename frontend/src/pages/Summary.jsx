import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { getInsights, getMeetingActionItems, sendSummary, sendReminder } from '../services/api';

export default function Summary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [completedItems, setCompletedItems] = useState({});

  useEffect(() => {
    Promise.all([
      getInsights(id),
      getMeetingActionItems(id),
    ]).then(([insightsRes, actionsRes]) => {
      setInsights(insightsRes.data);
      setActionItems(actionsRes.data || []);
    }).catch(() => toast.error("Failed to load summary"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendEmail = async () => {
    if (!email) return toast.error("Enter an email address");
    setSending(true);
    try {
      await sendSummary(id, email);
      toast.success("Summary sent successfully!");
      setEmail("");
    } catch { toast.error("Failed to send email"); }
    finally { setSending(false); }
  };

  const toggleItem = (idx) => {
    setCompletedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const insightsList = insights?.insights || [];
const decisions = insightsList.filter((i) => i.type === "decision") || [];
const openQuestions = insightsList.filter((i) => i.type === "open_question") || [];
const topics = insightsList.filter((i) => i.type === "topic") || [];
const summary = insightsList.find((i) => i.type === "summary")?.content || "";

  // Simulated speaking time based on transcript speakers
  const speakerColors = ["#0058c3", "#006a61", "#545f73"];

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fb", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ fontSize: 16, color: "#414754" }}>Loading summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
      <Toaster />

      {/* Sidebar */}
      <aside style={{
        position: "fixed", left: 0, top: 0, height: "100vh", width: 280,
        borderRight: "1px solid #c1c6d7", background: "#f7f9fb",
        display: "flex", flexDirection: "column", padding: "24px 0", zIndex: 50
      }}>
        <div style={{ padding: "0 24px", marginBottom: 40 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#191c1e", fontFamily: "Geist, sans-serif" }}>MeetMind</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#414754" }}>Meeting Assistant</p>
        </div>
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {[
            { icon: "📊", label: "Dashboard", action: () => navigate("/dashboard") },
              { icon: "🎙️", label: "Live Meeting", action: () => navigate("/meeting/" + id) },
              { icon: "📋", label: "Summary", active: true },
              { icon: "✅", label: "Action Items", action: () => navigate("/action-items") },
              { icon: "🗂️", label: "Archive", action: () => navigate("/archive") },
              { icon: "📈", label: "Analytics", action: () => navigate("/analytics") },
          ].map((item) => (
            <div key={item.label} onClick={item.action} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12, cursor: "pointer",
              color: item.active ? "#0058c3" : "#414754",
              fontWeight: item.active ? 700 : 400,
              background: item.active ? "#e6e8ea" : "transparent",
              marginBottom: 4, fontSize: 15
            }}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: "0 12px", borderTop: "1px solid #c1c6d7", paddingTop: 16 }}>
          <button
            onClick={() => navigate("/new-meeting")}
            style={{
              width: "100%", background: "#d8e2ff", color: "#001a43",
              border: "none", padding: "12px", borderRadius: 12,
              fontWeight: 600, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            + New Meeting
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 280, flex: 1 }}>

        {/* Top Bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(247,249,251,0.85)", backdropFilter: "blur(8px)",
          borderBottom: "1px solid #c1c6d7",
          padding: "12px 24px", display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ position: "relative", width: 360 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#727786" }}>🔍</span>
            <input
              placeholder="Search meeting notes..."
              style={{
                width: "100%", background: "#f2f4f6", border: "1px solid #c1c6d7",
                borderRadius: 999, padding: "8px 16px 8px 40px",
                fontSize: 14, outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "none", border: "1px solid #c1c6d7",
                padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                fontSize: 14, color: "#414754", fontWeight: 500
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <main style={{ padding: 24 }}>

          {/* Hero Section */}
          <section style={{ marginBottom: 24 }}>
            <div style={{
              background: "white", padding: 32, borderRadius: 12,
              border: "1px solid #c1c6d7", display: "flex",
              justifyContent: "space-between", alignItems: "flex-start", gap: 24
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{
                    padding: "4px 12px", background: "#89f5e7",
                    color: "#005049", borderRadius: 999, fontSize: 12, fontWeight: 600
                  }}>Completed</span>
                  <span style={{ fontSize: 14, color: "#414754" }}>Meeting Summary</span>
                </div>
                <h2 style={{
                  margin: "0 0 16px", fontSize: 32, fontWeight: 700,
                  color: "#191c1e", fontFamily: "Geist, sans-serif", letterSpacing: "-0.02em"
                }}>
                  Post-Meeting Summary
                </h2>
                <p style={{ margin: 0, fontSize: 16, color: "#414754", lineHeight: 1.7, maxWidth: 700 }}>
                  {summary || "AI-generated summary will appear here after analysis is complete."}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
                <button
                  onClick={() => {
                    const text = `Meeting Summary\n\nDecisions:\n${decisions.map(d => "• " + d.content).join("\n")}\n\nAction Items:\n${actionItems.map(a => "• " + a.description).join("\n")}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Copied to clipboard!");
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 16px", border: "1px solid #c1c6d7",
                    borderRadius: 8, background: "white", cursor: "pointer",
                    fontSize: 14, fontWeight: 600, color: "#191c1e"
                  }}
                >
                  📤 Share Recap
                </button>
              </div>
            </div>
          </section>

          {/* Bento Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>

            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Action Items */}
              <div style={{
                background: "white", padding: 24, borderRadius: 12,
                border: "1px solid #c1c6d7"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#191c1e", fontFamily: "Geist, sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    ✅ Action Items
                  </h3>
                  <span style={{ fontSize: 14, color: "#0058c3", fontWeight: 600 }}>
                    {actionItems.length} Tasks Identified
                  </span>
                </div>

                {actionItems.length === 0 ? (
                  <p style={{ color: "#727786", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                    No action items extracted yet. Run AI Analysis first.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleItem(idx)}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 12,
                          padding: 16, borderRadius: 12, cursor: "pointer",
                          border: "1px solid transparent",
                          background: completedItems[idx] ? "#f2f4f6" : "white",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#c1c6d7"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: 4, marginTop: 2, flexShrink: 0,
                          border: completedItems[idx] ? "none" : "1px solid #727786",
                          background: completedItems[idx] ? "#006a61" : "white",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          {completedItems[idx] && <span style={{ color: "white", fontSize: 12 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            margin: "0 0 8px", fontSize: 15, color: "#191c1e",
                            textDecoration: completedItems[idx] ? "line-through" : "none",
                            opacity: completedItems[idx] ? 0.5 : 1
                          }}>
                            {item.description}
                          </p>
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {item.assignee_email && (
                              <span style={{ fontSize: 13, color: "#414754", display: "flex", alignItems: "center", gap: 4 }}>
                                👤 {item.assignee_email}
                              </span>
                            )}
                            <button
  onClick={(e) => {
    e.stopPropagation();
    const email = prompt('Send reminder to email:');
    if (email) {
      sendReminder(id, email, item.description)
        .then(() => toast.success('Reminder sent!'))
        .catch(() => toast.error('Failed to send reminder'));
    }
  }}
  style={{
    background: '#d8e2ff', color: '#0058c3', border: 'none',
    padding: '4px 10px', borderRadius: 6, fontSize: 12,
    fontWeight: 600, cursor: 'pointer'
  }}
>
  ⏰ Remind
</button>
                            {item.due_date && (
                              <span style={{ fontSize: 13, color: "#414754", display: "flex", alignItems: "center", gap: 4 }}>
                                📅 {new Date(item.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Decisions & Questions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #c1c6d7" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#191c1e" }}>
                    🏛️ Key Decisions
                  </h3>
                  {decisions.length === 0 ? (
                    <p style={{ color: "#727786", fontSize: 14 }}>No decisions recorded</p>
                  ) : decisions.map((d, i) => (
                    <div key={i} style={{
                      padding: "10px 14px", background: "#f2f4f6",
                      borderRadius: 8, marginBottom: 8, fontSize: 14,
                      color: "#191c1e", borderLeft: "3px solid #0058c3"
                    }}>
                      {d.content}
                    </div>
                  ))}
                </div>

                <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #c1c6d7" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#191c1e" }}>
                    ❓ Open Questions
                  </h3>
                  {openQuestions.length === 0 ? (
                    <p style={{ color: "#727786", fontSize: 14 }}>No open questions</p>
                  ) : openQuestions.map((q, i) => (
                    <div key={i} style={{
                      padding: "10px 14px", background: "#ffdad6",
                      borderRadius: 8, marginBottom: 8, fontSize: 14,
                      color: "#93000a", borderLeft: "3px solid #ba1a1a"
                    }}>
                      {q.content}
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Email */}
              <div style={{
                background: "white", padding: 24, borderRadius: 12,
                border: "1px solid #c1c6d7"
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#191c1e" }}>
                  📧 Send Summary Email
                </h3>
                <div style={{ display: "flex", gap: 12 }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter participant email..."
                    style={{
                      flex: 1, border: "1px solid #c1c6d7", borderRadius: 8,
                      padding: "10px 14px", fontSize: 14, outline: "none"
                    }}
                  />
                  <button
                    onClick={handleSendEmail}
                    disabled={sending}
                    style={{
                      background: sending ? "#c1c6d7" : "#0058c3",
                      color: "white", border: "none", padding: "10px 20px",
                      borderRadius: 8, fontWeight: 600, fontSize: 14,
                      cursor: "pointer", whiteSpace: "nowrap"
                    }}
                  >
                    {sending ? "Sending..." : "Send Email"}
                  </button>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "#727786" }}>
                  Participants will receive a structured summary with decisions, action items, and open questions.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Topics */}
              <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #c1c6d7" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#191c1e" }}>
                  🏷️ Topics Discussed
                </h3>
                {topics.length === 0 ? (
                  <p style={{ color: "#727786", fontSize: 14 }}>No topics extracted yet</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {topics.map((t, i) => (
                      <span key={i} style={{
                        padding: "6px 14px", background: "#e0e3e5",
                        color: "#414754", borderRadius: 8, fontSize: 13, fontWeight: 500
                      }}>
                        {t.content}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sentiment */}
              <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #c1c6d7" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#191c1e", display: "flex", alignItems: "center", gap: 8 }}>
                  😊 Meeting Sentiment
                </h3>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ position: "relative", width: 140, height: 140 }}>
                    <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="70" cy="70" r="60" fill="transparent" stroke="#eceef0" strokeWidth="12" />
                      <circle cx="70" cy="70" r="60" fill="transparent" stroke="#00857a"
                        strokeWidth="12" strokeLinecap="round"
                        strokeDasharray="377" strokeDashoffset="68" />
                    </svg>
                    <div style={{
                      position: "absolute", top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)", textAlign: "center"
                    }}>
                      <span style={{ fontSize: 28, fontWeight: 700, color: "#191c1e", fontFamily: "Geist, sans-serif" }}>82%</span>
                      <span style={{ display: "block", fontSize: 11, color: "#414754", fontWeight: 500 }}>Positive</span>
                    </div>
                  </div>
                </div>
                {[
                  { label: "Constructive", value: "64%", color: "#00857a" },
                  { label: "Decisive", value: "28%", color: "#0058c3" },
                  { label: "Skeptical", value: "8%", color: "#c1c6d7" },
                ].map((s) => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#414754" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }}></span>
                      {s.label}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#191c1e" }}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #c1c6d7" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#191c1e" }}>
                  📊 Meeting Stats
                </h3>
                {[
                  { label: "Action Items", value: actionItems.length },
                  { label: "Decisions Made", value: decisions.length },
                  { label: "Open Questions", value: openQuestions.length },
                  { label: "Topics Covered", value: topics.length },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: "1px solid #f2f4f6"
                  }}>
                    <span style={{ fontSize: 14, color: "#414754" }}>{stat.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#191c1e" }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* AI Insight */}
              <div style={{
                background: "#d8e3fb", padding: 20, borderRadius: 12,
                border: "1px solid #bcc7de"
              }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#111c2d", display: "flex", alignItems: "center", gap: 6 }}>
                  ✨ AI Insight
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: "#3c475a", lineHeight: 1.6 }}>
                  {actionItems.length > 0
                    ? `${actionItems.length} action items were automatically extracted from this meeting. Ensure all assignees are notified.`
                    : "Run AI Analysis on the meeting transcript to extract insights, decisions, and action items automatically."}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/new-meeting")}
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: "50%",
          background: "#0058c3", color: "white", border: "none",
          fontSize: 28, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,88,195,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
        }}
      >
        +
      </button>
    </div>
  );
}