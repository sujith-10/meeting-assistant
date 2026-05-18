import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMeeting } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function NewMeeting() {
  const [title, setTitle] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoRecord, setAutoRecord] = useState(true);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(false);
  const [liveTranslation, setLiveTranslation] = useState(true);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email[0].toUpperCase();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }
    if (!consentGiven) {
      toast.error('Please confirm recording consent');
      return;
    }
    setLoading(true);
    try {
      const meeting = await createMeeting({ title: title.trim() });
navigate(`/meeting/${meeting.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      className="w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200"
      style={{ backgroundColor: value ? '#0058c3' : '#e0e3e5' }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200"
        style={{ left: value ? 'calc(100% - 18px)' : '2px' }}
      />
    </div>
  );

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toaster position="top-right" />

      {/* Decorative background */}
      <div className="fixed top-0 right-0 w-1/3 h-full -z-10 opacity-40 pointer-events-none">
        <div className="absolute rounded-full" style={{ top: '20%', right: '-10%', width: 500, height: 500, background: 'rgba(0,88,195,0.05)', filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ bottom: '10%', right: '10%', width: 300, height: 300, background: 'rgba(0,106,97,0.05)', filter: 'blur(80px)' }} />
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#f7f9fb] border-r border-[#c1c6d7] flex flex-col py-6 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-semibold text-[#191c1e]" style={{ fontFamily: 'Geist, sans-serif' }}>MeetMind</h1>
          <p className="text-sm text-[#414754]">Meeting Assistant</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors rounded-lg text-left">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          {/* Active */}
          <div className="flex items-center gap-4 px-6 py-3 text-[#0058c3] font-bold bg-[#e6e8ea] rounded-lg">
            <span className="material-symbols-outlined">mic_none</span>
            <span>Live Meeting</span>
          </div>
          <button onClick={() => navigate('/action-items')} className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors rounded-lg text-left">
            <span className="material-symbols-outlined">checklist</span>
            <span>Action Items</span>
          </button>
          <button onClick={() => navigate('/archive')} className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors rounded-lg text-left">
            <span className="material-symbols-outlined">history</span>
            <span>Archive</span>
          </button>
        </nav>
        <div className="mt-auto px-4 pt-6 space-y-1">
          <button onClick={() => navigate('/new-meeting')} className="w-full mb-6 flex items-center justify-center gap-2 bg-[#0070f3] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#0058c3] transition-colors">
            <span className="material-symbols-outlined">add</span>
            New Meeting
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors rounded-lg text-left">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#f7f9fb]/80 backdrop-blur-md border-b border-[#c1c6d7] px-6 py-4 ml-[280px] flex justify-between items-center h-20">
        <div className="flex items-center gap-3 bg-[#eceef0] px-4 py-2 rounded-full w-80 border border-[#c1c6d7]">
          <span className="material-symbols-outlined text-[#414754]">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#414754] outline-none" placeholder="Search meetings..." type="text" />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#414754] hover:bg-[#e6e8ea] rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-[#0058c3] text-white flex items-center justify-center font-bold text-sm">
            {getUserInitials()}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ml-[280px] p-10 flex justify-center items-start min-h-[calc(100vh-80px)]">
        <div
          className="w-full max-w-[800px] bg-white rounded-3xl p-10 border border-[#c1c6d7]/30"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' }}
        >
          {/* Header */}
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-semibold text-[#191c1e] mb-1" style={{ fontFamily: 'Geist, sans-serif', letterSpacing: '-0.02em' }}>
                Setup New Meeting
              </h2>
              <p className="text-base text-[#414754]">Configure your workspace for an intelligent orchestrated session.</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-[#eceef0] rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Left Column */}
            <div className="md:col-span-7 space-y-6">

              {/* Meeting Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#414754] block">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Product Roadmap Alignment"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-4 bg-[#f7f9fb] border border-[#c1c6d7] rounded-xl text-lg text-[#191c1e] focus:outline-none focus:border-[#0058c3] focus:ring-4 focus:ring-[#0058c3]/10 transition-all placeholder:text-[#727786]/50"
                />
              </div>

              {/* Recording Consent */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#414754] block">Recording Consent</label>
                <div
                  onClick={() => setConsentGiven(!consentGiven)}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    consentGiven ? 'border-[#0058c3] bg-[#d5e0f8]/20' : 'border-[#c1c6d7] bg-[#f7f9fb]'
                  }`}
                >
                  <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    consentGiven ? 'bg-[#0058c3] border-[#0058c3]' : 'border-[#c1c6d7] bg-white'
                  }`}>
                    {consentGiven && (
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>check</span>
                    )}
                  </div>
                  <p className="text-sm text-[#414754]">
                    I confirm all participants have been informed this meeting will be recorded and analyzed by AI.
                  </p>
                </div>
              </div>

              {/* Schedule for later */}
              <button className="flex items-center gap-2 text-[#414754] text-sm font-semibold hover:text-[#191c1e] transition-colors">
                <span className="material-symbols-outlined text-base">schedule_send</span>
                Schedule for later
              </button>
            </div>

            {/* Right Column */}
            <div className="md:col-span-5 space-y-6">

              {/* Intelligent Features */}
              <div className="bg-[#f2f4f6] p-6 rounded-xl border border-[#c1c6d7]/20 space-y-6">
                <h3 className="text-xs font-mono font-medium text-[#414754] uppercase tracking-wider">Intelligent Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#006a61]">radio_button_checked</span>
                      <div>
                        <p className="text-sm font-semibold text-[#191c1e]">Auto-record</p>
                        <p className="text-xs text-[#414754]">Capture transcript from start</p>
                      </div>
                    </div>
                    <Toggle value={autoRecord} onChange={setAutoRecord} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#006a61]">psychology</span>
                      <div>
                        <p className="text-sm font-semibold text-[#191c1e]">Sentiment Analysis</p>
                        <p className="text-xs text-[#414754]">Real-time mood tracking</p>
                      </div>
                    </div>
                    <Toggle value={sentimentAnalysis} onChange={setSentimentAnalysis} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#006a61]">translate</span>
                      <div>
                        <p className="text-sm font-semibold text-[#191c1e]">Live Translation</p>
                        <p className="text-xs text-[#414754]">Auto-detect 40+ languages</p>
                      </div>
                    </div>
                    <Toggle value={liveTranslation} onChange={setLiveTranslation} />
                  </div>
                </div>
              </div>

              {/* Ready indicator */}
              <div className="bg-[#f7f9fb] border border-[#c1c6d7] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#006a61]/10 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[#006a61]"
                    style={{
                      fontSize: '32px',
                      fontVariationSettings: "'FILL' 1",
                      animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite'
                    }}
                  >
                    graphic_eq
                  </span>
                </div>
                <p className="text-sm text-[#414754]">MeetMind is ready to listen and analyze your session.</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-10 pt-10 border-t border-[#c1c6d7] flex flex-col md:flex-row justify-end items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-10 py-3 text-[#414754] font-semibold hover:bg-[#eceef0] rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-3 bg-[#0058c3] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#004397] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Start Meeting
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}