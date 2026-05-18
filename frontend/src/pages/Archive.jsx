import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetings, deleteMeeting } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function Archive() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this meeting?')) return;
  try {
    await deleteMeeting(id);
    setMeetings(prev => prev.filter(m => m.id !== id));
    toast.success('Meeting deleted');
  } catch (err) {
    toast.error('Failed to delete meeting');
  }
};

  const fetchMeetings = async () => {
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (err) {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filtered = meetings.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return { month: '—', day: '—' };
    const d = new Date(dateStr);
    return {
      month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: d.getDate(),
    };
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return { icon: 'task_alt', color: 'text-tertiary' };
    if (status === 'active') return { icon: 'radio_button_checked', color: 'text-error' };
    return { icon: 'schedule', color: 'text-outline' };
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email[0].toUpperCase();
  };

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
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors duration-200 rounded-lg text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/new-meeting')}
            className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors duration-200 rounded-lg text-left"
          >
            <span className="material-symbols-outlined">mic_none</span>
            <span>Live Meeting</span>
          </button>
          <button
            onClick={() => navigate('/action-items')}
            className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors duration-200 rounded-lg text-left"
          >
            <span className="material-symbols-outlined">checklist</span>
            <span>Action Items</span>
          </button>
          {/* Active: Archive */}
          <div className="flex items-center gap-4 px-6 py-3 text-[#0058c3] font-bold bg-[#d5e0f8]/30 rounded-lg">
            <span className="material-symbols-outlined">history</span>
            <span>Archive</span>
          </div>
        </nav>

        <div className="mt-auto px-4 pt-6 space-y-1">
          <button
            onClick={() => navigate('/new-meeting')}
            className="w-full mb-6 flex items-center justify-center gap-2 bg-[#0070f3] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#0058c3] transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            New Meeting
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-3 text-[#414754] hover:bg-[#e6e8ea] transition-colors duration-200 rounded-lg text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 w-full bg-[#f7f9fb]/80 backdrop-blur-md border-b border-[#c1c6d7] px-6 py-4 flex justify-between items-center h-20">
          <div className="flex items-center gap-3 bg-[#eceef0] px-4 py-2 rounded-xl w-1/3 border border-[#c1c6d7]">
            <span className="material-symbols-outlined text-[#414754]">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#414754] outline-none"
              placeholder="Search archive..."
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-full bg-[#0058c3] text-white flex items-center justify-center font-bold text-sm">
              {getUserInitials()}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-[1280px] mx-auto">

          {/* Page Header */}
          <section className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
              <div>
                <h2 className="text-3xl font-semibold text-[#191c1e] mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>Meeting Archive</h2>
                <p className="text-base text-[#414754]">
                  {loading ? 'Loading...' : `Access ${filtered.length} recorded session${filtered.length !== 1 ? 's' : ''} and intelligent summaries.`}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c1c6d7] rounded-lg text-sm font-semibold hover:bg-[#f2f4f6] shadow-sm transition-colors">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  All Filters
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c1c6d7] rounded-lg text-sm font-semibold hover:bg-[#f2f4f6] shadow-sm transition-colors">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export
                </button>
              </div>
            </div>
          </section>

          {/* Meeting List */}
          <section className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0058c3]"></div>
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20 text-[#414754]">
                <span className="material-symbols-outlined text-5xl mb-3 block">history</span>
                <p className="text-lg font-semibold">No meetings found</p>
                <p className="text-sm mt-1">Try a different search or create a new meeting.</p>
                <button
                  onClick={() => navigate('/new-meeting')}
                  className="mt-4 px-6 py-2 bg-[#0058c3] text-white rounded-lg text-sm font-semibold hover:bg-[#0070f3] transition-colors"
                >
                  New Meeting
                </button>
              </div>
            ) : (
              paginated.map((meeting) => {
                const { month, day } = formatDate(meeting.created_at);
                const { icon, color } = getStatusIcon(meeting.status);
                return (
                  <div
                    key={meeting.id}
                    className="group bg-white rounded-xl p-6 border border-[#c1c6d7] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#0058c3]/40 transition-all duration-300"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' }}
                  >
                    {/* Left: Date + Info */}
                    <div className="flex items-start gap-6 flex-1">
                      <div className="hidden sm:flex flex-col items-center justify-center bg-[#eceef0] rounded-lg p-4 min-w-[72px]">
                        <span className="text-xs font-mono tracking-wider text-[#414754]">{month}</span>
                        <span className="text-2xl font-semibold text-[#191c1e]" style={{ fontFamily: 'Geist, sans-serif' }}>{day}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                          <h3 className="text-lg font-bold text-[#191c1e] group-hover:text-[#0058c3] transition-colors">
                            {meeting.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          {meeting.duration && (
                            <div className="flex items-center gap-1 text-[#414754] text-sm">
                              <span className="material-symbols-outlined text-base">schedule</span>
                              {formatDuration(meeting.duration)}
                            </div>
                          )}
                          <div className="flex gap-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                                meeting.status === 'completed'
                                  ? 'bg-[#89f5e7] text-[#00201d]'
                                  : meeting.status === 'active'
                                  ? 'bg-[#ffdad6] text-[#93000a]'
                                  : 'bg-[#e0e3e5] text-[#414754]'
                              }`}
                            >
                              {meeting.status || 'scheduled'}
                            </span>
                            {meeting.has_transcript && (
                              <span className="bg-[#d5e0f8]/50 text-[#586377] px-2 py-0.5 rounded text-xs font-mono font-medium">
                                Transcript
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
                      <button
                        onClick={() => navigate(`/meeting/${meeting.id}`)}
                        className="flex-1 md:flex-none px-6 py-2 bg-[#f2f4f6] border border-[#c1c6d7] rounded-lg text-sm font-semibold hover:bg-[#eceef0] transition-colors"
                      >
                        View Transcript
                      </button>
                      <button
  onClick={() => navigate(`/summary/${meeting.id}`)}
  className="flex-1 md:flex-none px-6 py-2 bg-[#0058c3] text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
>
  Summary
</button>
<button
  onClick={() => handleDelete(meeting.id)}
  className="flex-none px-3 py-2 bg-[#ffdad6] text-[#93000a] rounded-lg text-sm font-semibold hover:bg-[#ffb4ab] transition-colors"
>
  <span className="material-symbols-outlined text-base">delete</span>
</button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between pt-6 border-t border-[#c1c6d7] mt-10">
                <p className="text-sm text-[#414754]">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} meetings
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-[#c1c6d7] hover:bg-[#f2f4f6] disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-[#0058c3] text-white'
                          : 'border border-[#c1c6d7] hover:bg-[#f2f4f6]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && <span className="px-2 py-2 text-[#414754]">...</span>}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-[#c1c6d7] hover:bg-[#f2f4f6] disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/new-meeting')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#0058c3] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0070f3] active:scale-95 transition-all z-50"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}