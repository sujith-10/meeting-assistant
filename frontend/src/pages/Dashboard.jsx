import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, LogOut, Calendar, CheckCircle, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getMeetings()
      .then((res) => setMeetings(res.data))
      .catch(() => toast.error('Failed to load meetings'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'completed') return 'bg-gray-100 text-gray-600';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">🎙️ MeetingAI</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
          <button
            onClick={() => navigate('/action-items')}
            className="text-sm text-indigo-600 hover:underline"
          >
            Action Items
          </button>
          <button
            onClick={() => { logoutUser(); navigate('/'); }}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Meetings</h2>
            <p className="text-gray-500 mt-1">Manage and track all your meetings</p>
          </div>
          <button
            onClick={() => navigate('/new-meeting')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all"
          >
            <PlusCircle size={18} /> New Meeting
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="text-indigo-500" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-800">{meetings.length}</p>
                <p className="text-gray-500 text-sm">Total Meetings</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {meetings.filter(m => m.status === 'completed').length}
                </p>
                <p className="text-gray-500 text-sm">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-500" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {meetings.filter(m => m.status === 'scheduled').length}
                </p>
                <p className="text-gray-500 text-sm">Scheduled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No meetings yet</p>
            <p className="text-gray-300 mt-1">Create your first meeting to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => navigate(`/meeting/${meeting.id}`)}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{meeting.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{meeting.created_at}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                  {meeting.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}