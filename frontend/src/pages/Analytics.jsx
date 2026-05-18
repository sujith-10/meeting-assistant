import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetings, getInsights } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function Analytics() {
  const [meetings, setMeetings] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logoutUser, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getMeetings();
      const meetingsData = res.data || [];
      setMeetings(meetingsData);

      // Fetch insights for completed meetings
      const insightResults = [];
      for (const meeting of meetingsData) {
        try {
          const ins = await getInsights(meeting.id);
          insightResults.push({ meeting, insights: ins.data });
        } catch (e) {}
      }
      setInsights(insightResults);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email[0].toUpperCase();
  };

  // Compute stats
  const totalMeetings = meetings.length;
  const completedMeetings = meetings.filter(m => m.status === 'completed').length;
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled').length;
  const activeMeetings = meetings.filter(m => m.status === 'active').length;

  // Topics frequency
  const topicCount = {};
  insights.forEach(({ insights: ins }) => {
    const topics = ins?.topics || [];
    topics.forEach(topic => {
      const t = typeof topic === 'string' ? topic : topic.content || '';
      if (t) topicCount[t] = (topicCount[t] || 0) + 1;
    });
  });
  const topTopics = Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Action items stats
  let totalActionItems = 0;
  insights.forEach(({ insights: ins }) => {
    totalActionItems += (ins?.action_items || []).length;
  });

  // Meetings by day of week
  const dayCount = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  meetings.forEach(m => {
    if (m.created_at) {
      const day = dayNames[new Date(m.created_at).getDay()];
      dayCount[day] = (dayCount[day] || 0) + 1;
    }
  });
  const maxDay = Math.max(...Object.values(dayCount), 1);

  // Meetings over time (last 7)
  const recentMeetings = [...meetings]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 7)
    .reverse();

  const completionRate = totalMeetings > 0
    ? Math.round((completedMeetings / totalMeetings) * 100)
    : 0;

  const avgActionItems = completedMeetings > 0
    ? (totalActionItems / completedMeetings).toFixed(1)
    : 0;

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toaster position="top-right" />

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
          <button onClick={() => navigate('/new-meeting')} className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors rounded-lg text-left">
            <span className="material-symbols-outlined">mic_none</span>
            <span>Live Meeting</span>
          </button>
          <button onClick={() => navigate('/action-items')} className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors rounded-lg text-left">
            <span className="material-symbols-outlined">checklist</span>
            <span>Action Items</span>
          </button>
          <button onClick={() => navigate('/archive')} className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors rounded-lg text-left">
            <span className="material-symbols-outlined">history</span>
            <span>Archive</span>
          </button>
          {/* Active */}
          <div className="flex items-center gap-4 px-6 py-3 text-[#0058c3] font-bold bg-[#e6e8ea] rounded-lg">
            <span className="material-symbols-outlined">bar_chart</span>
            <span>Analytics</span>
          </div>
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
        <div>
          <h2 className="text-2xl font-semibold text-[#191c1e]" style={{ fontFamily: 'Geist, sans-serif' }}>Analytics</h2>
          <p className="text-sm text-[#414754]">Insights across all your meetings</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#0058c3] text-white flex items-center justify-center font-bold text-sm">
          {getUserInitials()}
        </div>
      </header>

      {/* Main */}
      <main className="ml-[280px] p-8 max-w-[1280px] mx-auto">

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0058c3]" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Meetings', value: totalMeetings, icon: 'groups', color: '#0058c3', bg: '#d5e0f8' },
                { label: 'Completed', value: completedMeetings, icon: 'task_alt', color: '#006a61', bg: '#89f5e7' },
                { label: 'Action Items', value: totalActionItems, icon: 'checklist', color: '#545f73', bg: '#d5e0f8' },
                { label: 'Completion Rate', value: `${completionRate}%`, icon: 'trending_up', color: '#0058c3', bg: '#d8e2ff' },
              ].map(({ label, value, icon, color, bg }) => (
                <div key={label} className="bg-white rounded-xl p-6 border border-[#c1c6d7]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                      <span className="material-symbols-outlined" style={{ color, fontSize: '20px' }}>{icon}</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#191c1e] mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>{value}</p>
                  <p className="text-sm text-[#414754]">{label}</p>
                </div>
              ))}
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Meeting Status Breakdown */}
              <div className="bg-white rounded-xl p-6 border border-[#c1c6d7]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 className="text-base font-bold text-[#191c1e] mb-6">Meeting Status Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Completed', count: completedMeetings, color: '#006a61', bg: '#89f5e7' },
                    { label: 'Scheduled', count: scheduledMeetings, color: '#0058c3', bg: '#d5e0f8' },
                    { label: 'Active', count: activeMeetings, color: '#ba1a1a', bg: '#ffdad6' },
                  ].map(({ label, count, color, bg }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{label}</span>
                        <span className="text-[#414754]">{count} meetings</span>
                      </div>
                      <div className="w-full bg-[#eceef0] h-2 rounded-full">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            backgroundColor: color,
                            width: totalMeetings > 0 ? `${(count / totalMeetings) * 100}%` : '0%'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Completion rate circle */}
                <div className="mt-6 flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eceef0" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke="#0058c3" strokeWidth="3"
                        strokeDasharray={`${completionRate} ${100 - completionRate}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-[#191c1e]">{completionRate}%</span>
                      <span className="text-xs text-[#414754]">Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meetings by Day of Week */}
              <div className="bg-white rounded-xl p-6 border border-[#c1c6d7]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 className="text-base font-bold text-[#191c1e] mb-6">Meetings by Day of Week</h3>
                <div className="flex items-end justify-between gap-2 h-40">
                  {Object.entries(dayCount).map(([day, count]) => (
                    <div key={day} className="flex flex-col items-center gap-2 flex-1">
                      <span className="text-xs text-[#414754]">{count}</span>
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${(count / maxDay) * 100}%`,
                          minHeight: count > 0 ? '8px' : '4px',
                          backgroundColor: count > 0 ? '#0058c3' : '#eceef0',
                        }}
                      />
                      <span className="text-xs font-medium text-[#414754]">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Topics & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Top Topics */}
              <div className="bg-white rounded-xl p-6 border border-[#c1c6d7]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 className="text-base font-bold text-[#191c1e] mb-6">Most Discussed Topics</h3>
                {topTopics.length === 0 ? (
                  <div className="text-center py-10 text-[#414754]">
                    <span className="material-symbols-outlined text-4xl mb-2 block">topic</span>
                    <p className="text-sm">Run AI analysis on meetings to see topics</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {topTopics.map(([topic, count]) => (
                      <span
                        key={topic}
                        className="px-3 py-1.5 rounded-full text-sm font-medium border"
                        style={{
                          backgroundColor: '#d5e0f8',
                          color: '#0058c3',
                          borderColor: '#aec6ff',
                          fontSize: `${Math.min(14 + count * 2, 20)}px`
                        }}
                      >
                        {topic} <span className="text-xs opacity-60">×{count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Meetings Activity */}
              <div className="bg-white rounded-xl p-6 border border-[#c1c6d7]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 className="text-base font-bold text-[#191c1e] mb-6">Recent Activity</h3>
                {recentMeetings.length === 0 ? (
                  <div className="text-center py-10 text-[#414754]">
                    <span className="material-symbols-outlined text-4xl mb-2 block">history</span>
                    <p className="text-sm">No meetings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentMeetings.map(meeting => (
                      <div
                        key={meeting.id}
                        onClick={() => navigate(`/summary/${meeting.id}`)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f2f4f6] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            meeting.status === 'completed' ? 'bg-[#006a61]' :
                            meeting.status === 'active' ? 'bg-[#ba1a1a]' : 'bg-[#c1c6d7]'
                          }`} />
                          <span className="text-sm font-medium text-[#191c1e]">{meeting.title}</span>
                        </div>
                        <span className="text-xs text-[#414754]">
                          {meeting.created_at ? new Date(meeting.created_at).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Stats Row */}
            <div className="mt-6 bg-[#0058c3] rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Avg Action Items per Meeting', value: avgActionItems },
                  { label: 'Meetings This Week', value: meetings.filter(m => {
                    const d = new Date(m.created_at);
                    const now = new Date();
                    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    return d > weekAgo;
                  }).length },
                  { label: 'Total Topics Discussed', value: Object.keys(topicCount).length },
                  { label: 'Active Meetings', value: activeMeetings },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>{value}</p>
                    <p className="text-sm opacity-80">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/new-meeting')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#0058c3] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}