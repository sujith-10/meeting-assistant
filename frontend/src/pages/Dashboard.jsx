import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getMeetings()
      .then((res) => setMeetings(res.data))
      .catch(() => toast.error('Failed to load meetings'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const completed = meetings.filter((m) => m.status === 'completed').length;
  const scheduled = meetings.filter((m) => m.status === 'scheduled').length;
  const active = meetings.filter((m) => m.status === 'active').length;

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return { border: '#006a61', bg: '#89f5e7', text: '#00201d' };
    if (status === 'active') return { border: '#0058c3', bg: '#d8e2ff', text: '#001a43' };
    return { border: '#727786', bg: '#e0e3e5', text: '#414754' };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f9fb', fontFamily: 'Inter, sans-serif' }}>
      <Toaster />

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, height: '100vh', width: 280,
        borderRight: '1px solid #c1c6d7', background: '#f7f9fb',
        display: 'flex', flexDirection: 'column', padding: '24px 0', zIndex: 50
      }}>
        <div style={{ padding: '0 24px', marginBottom: 40 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#191c1e', fontFamily: 'Geist, sans-serif' }}>MeetMind</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#414754' }}>Meeting Assistant</p>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { icon: '📊', label: 'Dashboard', active: true },
            { icon: '🎙️', label: 'Live Meeting', action: () => navigate('/new-meeting') },
            { icon: '✅', label: 'Action Items', action: () => navigate('/action-items') },
            { icon: '🗂️', label: 'Archive', action: () => navigate('/archive') },
            { icon: '📈', label: 'Analytics', action: () => navigate('/analytics') },
          ].map((item) => (
            <div
              key={item.label}
              onClick={item.action}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 24px', cursor: 'pointer',
                color: item.active ? '#0058c3' : '#414754',
                fontWeight: item.active ? 700 : 400,
                background: item.active ? '#d8e2ff' : 'transparent',
                borderRight: item.active ? '3px solid #0058c3' : '3px solid transparent',
                transition: 'all 0.15s',
                fontSize: 15,
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #c1c6d7', paddingTop: 16 }}>
          <button
            onClick={() => navigate('/new-meeting')}
            style={{
              margin: '0 16px 16px', width: 'calc(100% - 32px)',
              background: '#0058c3', color: 'white', border: 'none',
              padding: '12px 24px', borderRadius: 12, fontSize: 14,
              fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            + New Meeting
          </button>
          <div
            onClick={logoutUser}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '12px 24px', cursor: 'pointer', color: '#414754',
              fontSize: 14, transition: 'all 0.15s'
            }}
          >
            <span>🚪</span> Logout
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 280, flex: 1 }}>

        {/* Top Bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(247,249,251,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #c1c6d7',
          padding: '12px 48px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ position: 'relative', width: 400 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#727786' }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meetings..."
              style={{
                width: '100%', background: '#eceef0', border: '1px solid #c1c6d7',
                borderRadius: 999, padding: '8px 16px 8px 40px',
                fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {active > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', background: '#89f5e7',
                color: '#00201d', borderRadius: 999, fontSize: 12, fontWeight: 600
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#006a61', display: 'inline-block' }}></span>
                ACTIVE SESSION
              </span>
            )}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#0058c3', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: 48 }}>

          {/* Welcome */}
          <section style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 40, fontWeight: 700, color: '#191c1e', fontFamily: 'Geist, sans-serif', letterSpacing: '-0.02em' }}>
                Welcome back, {user?.name?.split(' ')[0] || 'there'}.
              </h2>
              <p style={{ margin: '8px 0 0', fontSize: 18, color: '#414754' }}>
                You have {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} recorded.
              </p>
            </div>
          </section>

          {/* Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, marginBottom: 32 }}>

            {/* Quick Start Card */}
            <div
              onClick={() => navigate('/new-meeting')}
              style={{
                gridColumn: 'span 4', background: '#0058c3', color: 'white',
                padding: 24, borderRadius: 12, display: 'flex',
                flexDirection: 'column', justifyContent: 'space-between',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                minHeight: 200, boxShadow: '0 4px 24px rgba(0,88,195,0.3)'
              }}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, fontFamily: 'Geist, sans-serif' }}>Quick Start</h3>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>
                  Start an AI-powered transcription session with real-time insight extraction.
                </p>
              </div>
              <button style={{
                marginTop: 20, background: 'white', color: '#0058c3',
                border: 'none', padding: '10px 20px', borderRadius: 8,
                fontWeight: 600, fontSize: 14, cursor: 'pointer', width: 'fit-content',
                position: 'relative', zIndex: 1
              }}>
                Start Now
              </button>
              <div style={{ position: 'absolute', right: -16, bottom: -16, fontSize: 120, opacity: 0.08 }}>🎙️</div>
            </div>

            {/* Stats */}
            <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { icon: '📁', label: 'Total Meetings', value: meetings.length, color: '#0058c3', bg: '#d8e2ff' },
                { icon: '✅', label: 'Completed', value: completed, color: '#006a61', bg: '#89f5e7' },
                { icon: '📅', label: 'Scheduled', value: scheduled, color: '#545f73', bg: '#d8e3fb' },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: 'white', padding: 20, borderRadius: 12,
                  border: '1px solid #c1c6d7', display: 'flex', alignItems: 'center', gap: 16
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: stat.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20, flexShrink: 0
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#414754', fontWeight: 500 }}>{stat.label}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 700, color: '#191c1e', fontFamily: 'Geist, sans-serif' }}>{stat.value}</p>
                  </div>
                </div>
              ))}

              {/* Bottom row stats */}
              {[
                { icon: '⏱️', label: 'Time Saved', value: `${(completed * 1.4).toFixed(1)} hrs` },
                { icon: '🤖', label: 'AI Efficiency', value: '+22%' },
                { icon: '📌', label: 'Action Items', value: completed * 3 },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: '#eceef0', padding: '14px 16px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <span style={{ fontSize: 18 }}>{stat.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#414754' }}>{stat.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: '#191c1e' }}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Meetings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#191c1e', fontFamily: 'Geist, sans-serif' }}>
                Recent Meetings
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {['All', 'Completed', 'Scheduled'].map((f) => (
                  <span key={f} style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 13,
                    background: f === 'All' ? '#e0e3e5' : 'white',
                    border: '1px solid #c1c6d7', color: '#414754', cursor: 'pointer'
                  }}>{f}</span>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#727786' }}>
                <div style={{ fontSize: 32 }}>⏳</div>
                <p>Loading meetings...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '64px 0',
                background: 'white', borderRadius: 12, border: '1px solid #c1c6d7'
              }}>
                <div style={{ fontSize: 48 }}>🎙️</div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#191c1e', margin: '12px 0 8px' }}>No meetings yet</p>
                <p style={{ color: '#727786', margin: '0 0 24px' }}>Create your first meeting to get started</p>
                <button
                  onClick={() => navigate('/new-meeting')}
                  style={{
                    background: '#0058c3', color: 'white', border: 'none',
                    padding: '12px 24px', borderRadius: 8, fontWeight: 600,
                    fontSize: 14, cursor: 'pointer'
                  }}
                >
                  + New Meeting
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {filtered.map((meeting) => {
                  const colors = getStatusColor(meeting.status);
                  return (
                    <div
                      key={meeting.id}
                      onClick={() => navigate('/meeting/' + meeting.id)}
                      style={{
                        background: 'white', padding: 24, borderRadius: 12,
                        border: '1px solid #c1c6d7', cursor: 'pointer',
                        borderLeft: `4px solid ${colors.border}`,
                        transition: 'all 0.15s', position: 'relative'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0058c3'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,88,195,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#c1c6d7'; e.currentTarget.style.borderLeftColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999, fontSize: 11,
                          fontWeight: 600, background: colors.bg, color: colors.text,
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          {meeting.status}
                        </span>
                        <span style={{ fontSize: 12, color: '#727786' }}>{getTimeAgo(meeting.created_at)}</span>
                      </div>

                      <h4 style={{
                        margin: '0 0 8px', fontSize: 16, fontWeight: 600,
                        color: '#191c1e', lineHeight: 1.4
                      }}>
                        {meeting.title}
                      </h4>

                      <p style={{ margin: 0, fontSize: 13, color: '#727786' }}>
                        Click to view transcript and insights
                      </p>

                      <div style={{
                        marginTop: 16, paddingTop: 16,
                        borderTop: '1px solid #e0e3e5',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                          {meeting.status === 'completed' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/summary/' + meeting.id); }}
                              style={{
                                background: '#d8e2ff', color: '#0058c3', border: 'none',
                                padding: '6px 12px', borderRadius: 6, fontSize: 12,
                                fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              View Summary
                            </button>
                          )}
                          {meeting.status !== 'completed' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/meeting/' + meeting.id); }}
                              style={{
                                background: '#0058c3', color: 'white', border: 'none',
                                padding: '6px 12px', borderRadius: 6, fontSize: 12,
                                fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              Join →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/new-meeting')}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: '#0058c3', color: 'white', border: 'none',
          fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,88,195,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}
      >
        +
      </button>
    </div>
  );
}