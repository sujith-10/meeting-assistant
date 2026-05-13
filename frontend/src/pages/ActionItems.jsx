import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllActionItems, completeActionItem, deleteActionItem, setDueDate } from '../services/api';
import { ArrowLeft, CheckCircle, Trash2, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ActionItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllActionItems()
      .then((res) => setItems(res.data))
      .catch(() => toast.error('Failed to load action items'))
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id) => {
    try {
      await completeActionItem(id);
      setItems(items.map(item => item.id === id ? { ...item, completed: true } : item));
      toast.success('Marked as complete!');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteActionItem(id);
      setItems(items.filter(item => item.id !== id));
      toast.success('Deleted!');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDueDate = async (id, date) => {
    try {
      await setDueDate(id, date);
      setItems(items.map(item => item.id === id ? { ...item, due_date: date } : item));
      toast.success('Due date set!');
    } catch {
      toast.error('Failed to set due date');
    }
  };

  const pending = items.filter(i => !i.completed);
  const completed = items.filter(i => i.completed);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <nav className="bg-white shadow-sm px-6 py-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Action Items Tracker</h2>
        <p className="text-gray-500 mb-8">Track all action items from your meetings</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-800">{items.length}</p>
            <p className="text-gray-500 text-sm">Total</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
            <p className="text-gray-500 text-sm">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{completed.length}</p>
            <p className="text-gray-500 text-sm">Completed</p>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : (
          <>
            {/* Pending Items */}
            <h3 className="font-semibold text-gray-700 mb-3">Pending ({pending.length})</h3>
            <div className="space-y-3 mb-8">
              {pending.length === 0 ? (
                <p className="text-gray-400 text-sm">No pending items 🎉</p>
              ) : pending.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{item.description}</p>
                    <p className="text-indigo-500 text-xs mt-1">Assignee: {item.assignee || 'Unknown'}</p>
                    {item.due_date && (
                      <p className="text-gray-400 text-xs mt-1">Due: {item.due_date}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <input
                      type="date"
                      onChange={(e) => handleDueDate(item.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => handleComplete(item.id)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Completed Items */}
            <h3 className="font-semibold text-gray-700 mb-3">Completed ({completed.length})</h3>
            <div className="space-y-3">
              {completed.length === 0 ? (
                <p className="text-gray-400 text-sm">No completed items yet</p>
              ) : completed.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center opacity-60">
                  <div>
                    <p className="text-gray-600 line-through">{item.description}</p>
                    <p className="text-gray-400 text-xs mt-1">Assignee: {item.assignee || 'Unknown'}</p>
                  </div>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}