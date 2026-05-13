import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadAudio, analyzeTranscript, getTranscript, endMeeting } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => {
    getTranscript(id)
      .then((res) => setTranscript(res.data))
      .catch(() => {});
  }, [id]);

  const handleUpload = async () => {
    if (!file) return toast.error('Please select an audio file');
    setUploading(true);
    try {
      const res = await uploadAudio(id, file);
      setTranscript(res.data.utterances || []);
      toast.success('Audio transcribed successfully!');
    } catch (err) {
      toast.error('Transcription failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeTranscript(id);
      setAnalyzed(true);
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEndMeeting = async () => {
    await endMeeting(id);
    navigate('/summary/' + id);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Toaster />
      <nav style={{ background: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, background: 'red', borderRadius: '50%' }}></div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Meeting Room</h1>
        </div>
        <button onClick={handleEndMeeting} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
          End Meeting
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Transcript Panel */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Live Transcript</h2>
          {transcript.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
              <p>No transcript yet</p>
              <p style={{ fontSize: 14 }}>Upload an audio file to start</p>
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {transcript.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {item.speaker || 'Speaker'}
                  </span>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600 }}>Upload Audio</h3>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ width: '100%', fontSize: 13, marginBottom: 8 }}
            />
            {file && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>{file.name}</p>}
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{ width: '100%', background: '#4f46e5', color: 'white', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}
            >
              {uploading ? 'Transcribing...' : 'Transcribe Audio'}
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600 }}>AI Analysis</h3>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>Extract decisions, action items and insights</p>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || transcript.length === 0}
              style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', opacity: (analyzing || transcript.length === 0) ? 0.6 : 1 }}
            >
              {analyzing ? 'Analyzing...' : analyzed ? 'Analyzed!' : 'Run AI Analysis'}
            </button>
          </div>

          <button
            onClick={handleEndMeeting}
            style={{ background: '#1f2937', color: 'white', border: 'none', padding: '12px', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}
          >
            View Summary
          </button>
        </div>
      </div>
    </div>
  );
}