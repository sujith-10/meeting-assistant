import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadAudio, analyzeTranscript, getTranscript, endMeeting } from "../services/api";
import toast, { Toaster } from "react-hot-toast";

export default function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [timer, setTimer] = useState(0);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    getTranscript(id).then((res) => setTranscript(res.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, liveText]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const speakerColors = ["#0058c3", "#006a61", "#545f73", "#ba1a1a", "#7c4dff"];
  const getSpeakerColor = (speaker) => {
    const index = (speaker?.charCodeAt(0) || 0) % speakerColors.length;
    return speakerColors[index];
  };

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Use Chrome for live transcription!"); return; }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.onstart = () => { setIsRecording(true); toast.success("Live transcription started!"); };
    r.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (final) {
        setTranscript((p) => [...p, { speaker: "You", text: final }]);
        setLiveText("");
        fetch("http://localhost:8000/transcripts/" + id + "/add", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") },
          body: JSON.stringify({ text: final, speaker_label: "A" }),
        }).catch(() => {});
      } else setLiveText(interim);
    };
    r.onerror = () => setIsRecording(false);
    r.onend = () => setIsRecording(false);
    recognitionRef.current = r;
    r.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    setTimer(0);
    toast.success("Recording stopped!");
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Select a file");
    setUploading(true);
    try {
      const res = await uploadAudio(id, file);
      setTranscript(res.data.utterances || []);
      toast.success("Transcribed successfully!");
    } catch { toast.error("Transcription failed"); }
    finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeTranscript(id);
      setAnalyzed(true);
      toast.success("AI analysis complete!");
    } catch { toast.error("Analysis failed"); }
    finally { setAnalyzing(false); }
  };

  const handleEnd = async () => {
    if (isRecording) stopRecording();
    await endMeeting(id);
    navigate("/summary/" + id);
  };

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
            { icon: "🎙️", label: "Live Meeting", active: true },
            { icon: "📋", label: "Summary", action: () => navigate("/summary/" + id) },
            { icon: "✅", label: "Action Items", action: () => navigate("/action-items") },
          ].map((item) => (
            <div key={item.label} onClick={item.action} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12, cursor: "pointer",
              color: item.active ? "#0058c3" : "#414754",
              fontWeight: item.active ? 700 : 400,
              background: item.active ? "#d8e2ff" : "transparent",
              marginBottom: 4, fontSize: 15
            }}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 280, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top Bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
          borderBottom: "1px solid #c1c6d7",
          padding: "12px 24px", display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#191c1e", fontFamily: "Geist, sans-serif" }}>
              Meeting Room
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isRecording && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 14px", background: "#ffdad6",
                color: "#93000a", borderRadius: 999, fontSize: 12, fontWeight: 600
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ba1a1a", display: "inline-block" }}></span>
                LIVE • {formatTime(timer)}
              </div>
            )}
            <button
              onClick={handleEnd}
              style={{
                background: "#ba1a1a", color: "white", border: "none",
                padding: "8px 20px", borderRadius: 8, fontWeight: 600,
                fontSize: 14, cursor: "pointer"
              }}
            >
              End Meeting
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: 24, display: "flex", gap: 24, flex: 1 }}>

          {/* Left — Transcript */}
          <div style={{
            flex: 1, background: "white", borderRadius: 12,
            padding: 32, border: "1px solid #c1c6d7",
            display: "flex", flexDirection: "column", minHeight: 600
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#191c1e", fontFamily: "Geist, sans-serif" }}>
                  Live Transcript
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 14, color: "#414754" }}>
                  {isRecording ? "Recording in progress..." : "Start recording or upload audio"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {isRecording && (
                  <span style={{
                    padding: "4px 12px", background: "rgba(0,106,97,0.1)",
                    color: "#006a61", borderRadius: 999, fontSize: 12, fontWeight: 600
                  }}>
                    Automated Recording
                  </span>
                )}
              </div>
            </div>

            {/* Transcript Lines */}
            <div style={{ flex: 1, overflowY: "auto", paddingLeft: 24, borderLeft: "1px solid #e0e3e5" }}>
              {transcript.length === 0 && !liveText ? (
                <div style={{ textAlign: "center", padding: "64px 0", color: "#727786" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎙️</div>
                  <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>No transcript yet</p>
                  <p style={{ fontSize: 14, margin: 0 }}>Start recording or upload an audio file</p>
                </div>
              ) : (
                <>
                  {transcript.map((item, i) => (
                    <div key={i} style={{ marginBottom: 28, position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: getSpeakerColor(item.speaker),
                          color: "white", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0
                        }}>
                          {(item.speaker || "S").charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#191c1e" }}>
                          Speaker {item.speaker || "A"}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 0 44px", fontSize: 16, color: "#414754", lineHeight: 1.6 }}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                  {liveText && (
                    <div style={{ marginBottom: 28, opacity: 0.6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "#0058c3", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700
                        }}>Y</div>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#191c1e" }}>You</span>
                        <span style={{ fontSize: 12, color: "#006a61", fontWeight: 600 }}>● Speaking</span>
                      </div>
                      <p style={{ margin: "0 0 0 44px", fontSize: 16, color: "#414754", lineHeight: 1.6, fontStyle: "italic" }}>
                        {liveText}
                      </p>
                    </div>
                  )}
                  <div ref={transcriptEndRef} />
                </>
              )}
            </div>

            {/* Flag Insight Button */}
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || transcript.length === 0}
                style={{
                  background: analyzing ? "#c1c6d7" : "#0058c3",
                  color: "white", border: "none",
                  padding: "12px 24px", borderRadius: 999,
                  fontWeight: 600, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(0,88,195,0.3)"
                }}
              >
                🤖 {analyzing ? "Analyzing..." : analyzed ? "✅ Analysis Complete!" : "Run AI Analysis"}
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Recording Controls */}
            <div style={{
              background: "white", borderRadius: 12, padding: 20,
              border: "1px solid #c1c6d7"
            }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#414754", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Recording Controls
              </h3>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {!isRecording ? (
                  <button onClick={startRecording} style={{
                    width: "100%", background: "#ba1a1a", color: "white",
                    border: "none", padding: "12px", borderRadius: 8,
                    fontWeight: 600, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}>
                    🎙️ Start Live Recording
                  </button>
                ) : (
                  <button onClick={stopRecording} style={{
                    width: "100%", background: "#1f2937", color: "white",
                    border: "none", padding: "12px", borderRadius: 8,
                    fontWeight: 600, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}>
                    ⏹️ Stop Recording
                  </button>
                )}
              </div>
            </div>

            {/* Upload Audio */}
            <div style={{
              background: "white", borderRadius: 12, padding: 20,
              border: "1px solid #c1c6d7"
            }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 600, color: "#414754", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Upload Audio File
              </h3>
              <input
                type="file" accept="audio/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ width: "100%", fontSize: 13, marginBottom: 10 }}
              />
              {file && (
                <p style={{ fontSize: 12, color: "#414754", margin: "0 0 10px", padding: "6px 10px", background: "#eceef0", borderRadius: 6 }}>
                  📁 {file.name}
                </p>
              )}
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  width: "100%", background: uploading ? "#c1c6d7" : "#0058c3",
                  color: "white", border: "none", padding: "10px",
                  borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer"
                }}
              >
                {uploading ? "Transcribing..." : "Transcribe Audio"}
              </button>
            </div>

            {/* Automated Action Items */}
            <div style={{
              background: "white", borderRadius: 12, padding: 20,
              border: "1px solid #c1c6d7", flex: 1
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#414754", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Automated Action Items
                </h3>
                <span>✨</span>
              </div>

              {analyzed ? (
                <div style={{ padding: 16, background: "#d8e2ff", borderRadius: 10, borderLeft: "4px solid #0058c3" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#001a43" }}>✅ Analysis Complete</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#414754" }}>Action items extracted from transcript</p>
                  <button
                    onClick={() => navigate("/summary/" + id)}
                    style={{
                      marginTop: 12, background: "#0058c3", color: "white",
                      border: "none", padding: "8px 16px", borderRadius: 6,
                      fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%"
                    }}
                  >
                    View Full Summary →
                  </button>
                </div>
              ) : (
                <div style={{ padding: 16, background: "#eceef0", borderRadius: 10, textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#727786" }}>
                    Run AI Analysis to automatically extract action items from the transcript
                  </p>
                </div>
              )}

              {/* Meeting Pulse */}
              <div style={{
                marginTop: 16, padding: 16, background: "#d8e3fb",
                borderRadius: 10, border: "1px solid #bcc7de"
              }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#111c2d", display: "flex", alignItems: "center", gap: 6 }}>
                  🧠 Meeting Pulse
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: "#3c475a", lineHeight: 1.5 }}>
                  {isRecording
                    ? "Recording in progress. Words are being captured in real-time."
                    : transcript.length > 0
                    ? `${transcript.length} transcript segments captured. Ready for AI analysis.`
                    : "Start recording or upload audio to begin transcription."}
                </p>
              </div>
            </div>

            {/* View Summary Button */}
            <button
              onClick={handleEnd}
              style={{
                background: "#191c1e", color: "white", border: "none",
                padding: "14px", borderRadius: 12, fontWeight: 600,
                fontSize: 15, cursor: "pointer"
              }}
            >
              End Meeting & View Summary →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}