content = open(r"C:\Users\sujith srirangam\meeting-assistant\frontend\src\pages\MeetingRoom.jsx", "w", encoding="utf-8")
content.write("""import { useState, useEffect, useRef } from "react";
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
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    getTranscript(id).then((res) => setTranscript(res.data)).catch(() => {});
  }, [id]);

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Use Chrome!"); return; }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.onstart = () => { setIsRecording(true); toast.success("Recording started!"); };
    r.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (final) {
        setTranscript((p) => [...p, { speaker: "A", text: final }]);
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
    toast.success("Stopped!");
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Select a file");
    setUploading(true);
    try {
      const res = await uploadAudio(id, file);
      setTranscript(res.data.utterances || []);
      toast.success("Transcribed!");
    } catch { toast.error("Failed"); }
    finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeTranscript(id);
      setAnalyzed(true);
      toast.success("Analysis complete!");
    } catch { toast.error("Failed"); }
    finally { setAnalyzing(false); }
  };

  const handleEnd = async () => {
    if (isRecording) stopRecording();
    await endMeeting(id);
    navigate("/summary/" + id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Toaster />
      <nav style={{ background: "white", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, background: isRecording ? "red" : "#d1d5db", borderRadius: "50%" }}></div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Meeting Room</h1>
          {isRecording && <span style={{ fontSize: 12, color: "red", fontWeight: 600 }}>LIVE</span>}
        </div>
        <button onClick={handleEnd} style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>End Meeting</button>
      </nav>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Live Transcript {isRecording ? "🔴" : ""}</h2>
          {transcript.length === 0 && !liveText ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 32 }}>🎙️</p>
              <p>No transcript yet — start recording or upload audio</p>
            </div>
          ) : (
            <div style={{ maxHeight: 450, overflowY: "auto" }}>
              {transcript.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <span style={{ background: "#e0e7ff", color: "#4338ca", padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{item.speaker || "A"}</span>
                  <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{item.text}</p>
                </div>
              ))}
              {liveText && (
                <div style={{ display: "flex", gap: 12, opacity: 0.6 }}>
                  <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>Live</span>
                  <p style={{ margin: 0, fontSize: 14, fontStyle: "italic" }}>{liveText}</p>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600 }}>🎙️ Live Recording</h3>
            {!isRecording
              ? <button onClick={startRecording} style={{ width: "100%", background: "#dc2626", color: "white", border: "none", padding: 10, borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Start Recording</button>
              : <button onClick={stopRecording} style={{ width: "100%", background: "#1f2937", color: "white", border: "none", padding: 10, borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Stop Recording</button>
            }
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600 }}>📁 Upload Audio</h3>
            <input type="file" accept="audio/*,video/*" onChange={(e) => setFile(e.target.files[0])} style={{ width: "100%", fontSize: 13, marginBottom: 8 }} />
            <button onClick={handleUpload} disabled={uploading} style={{ width: "100%", background: "#4f46e5", color: "white", border: "none", padding: 10, borderRadius: 8, cursor: "pointer" }}>
              {uploading ? "Transcribing..." : "Transcribe Audio"}
            </button>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600 }}>🤖 AI Analysis</h3>
            <button onClick={handleAnalyze} disabled={analyzing || transcript.length === 0} style={{ width: "100%", background: "#16a34a", color: "white", border: "none", padding: 10, borderRadius: 8, cursor: "pointer" }}>
              {analyzing ? "Analyzing..." : analyzed ? "✅ Analyzed!" : "Run AI Analysis"}
            </button>
          </div>
          <button onClick={handleEnd} style={{ background: "#1f2937", color: "white", border: "none", padding: 12, borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 15 }}>
            View Summary →
          </button>
        </div>
      </div>
    </div>
  );
}
""")
content.close()
print("Done!")