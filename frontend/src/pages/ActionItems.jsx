import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetings, getInsights } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function ActionItems() {
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchActionItems();
  }, []);

  const fetchActionItems = async () => {
  try {
    const meetingsData = await getMeetings();
    const allItems = [];
    for (const meeting of meetingsData.data) {
      try {
        const insights = await getInsights(meeting.id);
        const items = insights.data?.action_items || [];
        items.forEach(item => allItems.push({
          id: `${meeting.id}-${Math.random()}`,
          description: item,
          meeting_title: meeting.title,
          completed: false,
          priority: 'medium'
        }));
      } catch (e) {}
    }
    setActionItems(allItems);
  } catch (err) {
    toast.error('Failed to load action items');
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email[0].toUpperCase();
  };

  const filtered = actionItems.filter(item => {
    const matchesStatus =
      filter === 'all' ? true :
      filter === 'completed' ? item.completed :
      filter === 'pending' ? !item.completed : true;
    const matchesPriority =
      priorityFilter === 'all' ? true :
      (item.priority || '').toLowerCase() === priorityFilter;
    const matchesSearch =
      search === '' ? true :
      (item.description || item.task || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const completedCount = actionItems.filter(i => i.completed).length;
  const completionRate = actionItems.length > 0
    ? Math.round((completedCount / actionItems.length) * 100)
    : 0;

  const getPriorityStyle = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return { bg: '#ffdad6', text: '#93000a' };
      case 'medium': return { bg: '#d5e0f8', text: '#586377' };
      case 'low': return { bg: '#eceef0', text: '#414754' };
      default: return { bg: '#eceef0', text: '#414754' };
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
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
          {/* Active */}
          <div className="flex items-center gap-4 px-6 py-3 text-[#0058c3] font-bold bg-[#e6e8ea] rounded-lg">
            <span className="material-symbols-outlined">checklist</span>
            <span>Action Items</span>
          </div>
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
      <header className="sticky top-0 z-40 w-[calc(100%-280px)] ml-[280px] h-16 border-b border-[#c1c6d7] flex items-center justify-between px-6"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(247,249,251,0.8)' }}>
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#414754]">search</span>
            <input
              className="w-full bg-white border border-[#c1c6d7] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#0058c3] focus:ring-4 focus:ring-[#0058c3]/10 transition-all"
              placeholder="Search tasks or meetings..."
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-[#414754] hover:bg-[#e6e8ea] rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-[#0058c3] text-white flex items-center justify-center font-bold text-sm ml-2">
            {getUserInitials()}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ml-[280px] p-10 max-w-[1280px] mx-auto min-h-screen">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-bold text-[#191c1e] tracking-tight mb-1" style={{ fontFamily: 'Geist, sans-serif', letterSpacing: '-0.02em' }}>
              Action Items
            </h2>
            <p className="text-lg text-[#414754]">Cognitive clarity for your team's progress.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 px-4 py-2 bg-[#006a61]/10 text-[#006a61] rounded-full text-xs font-mono font-medium uppercase">
              <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse" />
              Live Syncing
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className="rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3 border border-[#c1c6d7]"
          style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.8)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-[#eceef0] rounded-lg border border-[#c1c6d7]">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
            <span className="text-sm font-semibold">Filters:</span>
          </div>
          <select
            value={filter}
            onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-[#c1c6d7] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0058c3]/20"
          >
            <option value="all">All Statuses</option>
            <option value="pending">To Do</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-[#c1c6d7] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0058c3]/20"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="ml-auto flex items-center gap-2 text-[#0058c3] font-semibold px-4 py-2 hover:bg-[#0058c3]/5 rounded-lg transition-colors text-sm">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>sort</span>
            Sort by Date
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Task List */}
          <div className="lg:col-span-8 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0058c3]" />
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20 text-[#414754]">
                <span className="material-symbols-outlined text-5xl mb-3 block">checklist</span>
                <p className="text-lg font-semibold">No action items found</p>
                <p className="text-sm mt-1">Run AI analysis on a meeting to generate action items.</p>
              </div>
            ) : (
              paginated.map(item => {
                const { bg, text } = getPriorityStyle(item.priority);
                const taskText = item.description || item.task || 'Untitled task';
                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-xl p-6 hover:border-[#0058c3]/40 transition-colors group ${
                      item.priority?.toLowerCase() === 'high' ? 'border-l-4 border-l-[#ba1a1a]' :
                      item.priority?.toLowerCase() === 'medium' ? 'border-l-4 border-l-[#0058c3]' :
                      'border-[#c1c6d7]'
                    }`}
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <div
                          onClick={() => toggleComplete(item)}
                          className="w-6 h-6 rounded border-2 flex items-center justify-center transition-colors cursor-pointer"
                          style={{
                            backgroundColor: item.completed ? '#0058c3' : 'white',
                            borderColor: item.completed ? '#0058c3' : '#c1c6d7',
                          }}
                        >
                          {item.completed && (
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check</span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1 gap-3">
                          <h3 className={`text-base font-semibold text-[#191c1e] ${item.completed ? 'line-through opacity-60' : ''}`}>
                            {taskText}
                          </h3>
                          {item.priority && (
                            <span
                              className="text-xs font-mono font-medium px-2 py-0.5 rounded-full uppercase flex-shrink-0"
                              style={{ backgroundColor: bg, color: text }}
                            >
                              {item.priority}
                            </span>
                          )}
                        </div>

                        {item.assignee && (
                          <p className="text-sm text-[#414754] mb-4">{item.assignee}</p>
                        )}

                        <div className={`flex flex-wrap items-center gap-6 pt-4 border-t border-[#c1c6d7]/30 ${item.completed ? 'opacity-60' : ''}`}>
                          {item.meeting_title && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[#414754]" style={{ fontSize: '18px' }}>groups</span>
                              <span className="text-sm font-medium">{item.meeting_title}</span>
                            </div>
                          )}
                          {item.assignee && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[#414754]" style={{ fontSize: '18px' }}>person</span>
                              <span className="text-sm">{item.assignee}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="material-symbols-outlined text-[#414754]" style={{ fontSize: '18px' }}>event</span>
                            <span className="text-sm">
                              {item.completed ? 'Completed' : item.due_date ? `Due ${new Date(item.due_date).toLocaleDateString()}` : 'No due date'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div className="mt-10 flex items-center justify-between">
                <p className="text-sm text-[#414754]">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} action items
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-[#c1c6d7] hover:bg-[#eceef0] disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        currentPage === page ? 'bg-[#0058c3] text-white' : 'border border-[#c1c6d7] hover:bg-[#eceef0]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-[#c1c6d7] hover:bg-[#eceef0] disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-4 space-y-6">

            {/* Weekly Progress */}
            <div className="bg-[#0058c3] text-white rounded-xl p-6 relative overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider opacity-80">Weekly Progress</h4>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-bold leading-none" style={{ fontFamily: 'Geist, sans-serif' }}>{completionRate}%</span>
                <span className="text-sm mb-2">Completion Rate</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full mb-4">
                <div className="bg-white h-full rounded-full transition-all" style={{ width: `${completionRate}%` }} />
              </div>
              <p className="text-sm opacity-90 italic">
                {completedCount} of {actionItems.length} items completed this week.
              </p>
            </div>

            {/* Stats breakdown */}
            <div className="bg-white border border-[#c1c6d7] rounded-xl p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h4 className="text-sm font-bold mb-6">Breakdown by Priority</h4>
              <div className="space-y-4">
                {[
                  { label: 'High Priority', color: '#ba1a1a', count: actionItems.filter(i => i.priority?.toLowerCase() === 'high').length },
                  { label: 'Medium Priority', color: '#0058c3', count: actionItems.filter(i => i.priority?.toLowerCase() === 'medium').length },
                  { label: 'Low Priority', color: '#545f73', count: actionItems.filter(i => i.priority?.toLowerCase() === 'low').length },
                ].map(({ label, color, count }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{label}</span>
                      <span className="text-[#414754]">{count} tasks</span>
                    </div>
                    <div className="w-full bg-[#eceef0] h-1.5 rounded-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: color,
                          width: actionItems.length > 0 ? `${(count / actionItems.length) * 100}%` : '0%'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-[#c1c6d7] rounded-xl p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h4 className="text-sm font-bold mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/new-meeting')}
                  className="w-full py-2 bg-[#0058c3] text-white rounded-lg text-sm font-semibold hover:bg-[#004397] transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  New Meeting
                </button>
                <button
                  onClick={() => navigate('/archive')}
                  className="w-full py-2 border border-[#c1c6d7] rounded-lg text-sm font-semibold hover:bg-[#f2f4f6] transition-colors"
                >
                  View Archive
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/new-meeting')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#0058c3] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
      </button>
    </div>
  );
}