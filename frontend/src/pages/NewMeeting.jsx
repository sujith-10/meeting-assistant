import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMeeting } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function NewMeeting() {
  const [title, setTitle] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!title) return toast.error('Please enter a meeting title');
    if (!consent) return toast.error('Participant consent is required');
    setLoading(true);
    try {
      const res = await createMeeting(title);
      toast.success('Meeting created!');
      navigate('/meeting/' + res.data.id);
    } catch (err) {
      toast.error('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Toaster />
      <nav style={{ background: 'white', padding: '16px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: 14 }}
        >
          Back to Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>New Meeting</h2>
          <p style={{ margin: '0 0 32px', color: '#6b7280' }}>Set up recording and transcription</p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Meeting Title
            </label>
            <input
              type="text"
              placeholder="e.g. Q2 Planning Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '12px 16px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#92400e' }}>
              Participant Consent Required
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#b45309' }}>
              All participants must be informed and consent to being recorded and transcribed.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#92400e' }}>
                All participants have given their consent to be recorded
              </span>
            </label>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#1e40af' }}>
              AI Features Enabled
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13, color: '#1d4ed8', lineHeight: 2 }}>
              <li>✅ Real-time transcription with speaker identification</li>
              <li>✅ Automatic action item detection</li>
              <li>✅ Decision and question extraction</li>
              <li>✅ Post-meeting summary generation</li>
              <li>✅ Automated email summary to participants</li>
            </ul>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            style={{ width: '100%', background: '#4f46e5', color: 'white', border: 'none', padding: '14px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Creating...' : 'Create Meeting & Start'}
          </button>
        </div>
      </div>
    </div>
  );
}