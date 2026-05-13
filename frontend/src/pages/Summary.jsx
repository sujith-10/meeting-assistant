import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInsights, sendSummary } from '../services/api';
import { ArrowLeft, Send, CheckCircle, HelpCircle, Lightbulb, Tag } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Summary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getInsights(id)
      .then((res) => setInsights(res.data))
      .catch(() => toast.error('Failed to load insights'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendEmail = async () => {
    if (!email) return toast.error('Please enter an email address');
    setSending(true);
    try {
      await sendSummary(id, email);
      toast.success('Summary email sent!');
      setEmail('');
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading summary...</p>
    </div>
  );

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Post-Meeting Summary</h2>
        <p className="text-gray-500 mb-8">AI-generated insights from your meeting</p>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Decisions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-500" size={20} />
              <h3 className="font-semibold text-gray-800">Key Decisions</h3>
            </div>
            {insights?.decisions?.length === 0 ? (
              <p className="text-gray-400 text-sm">No decisions recorded</p>
            ) : (
              <ul className="space-y-2">
                {insights?.decisions?.map((d, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">•</span> {d}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Open Questions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="text-amber-500" size={20} />
              <h3 className="font-semibold text-gray-800">Open Questions</h3>
            </div>
            {insights?.open_questions?.length === 0 ? (
              <p className="text-gray-400 text-sm">No open questions</p>
            ) : (
              <ul className="space-y-2">
                {insights?.open_questions?.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 mt-0.5">?</span> {q}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="text-indigo-500" size={20} />
              <h3 className="font-semibold text-gray-800">Action Items</h3>
            </div>
            {insights?.action_items?.length === 0 ? (
              <p className="text-gray-400 text-sm">No action items</p>
            ) : (
              <ul className="space-y-3">
                {insights?.action_items?.map((a, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-gray-700">{a.description}</p>
                    <p className="text-indigo-500 text-xs mt-1">
                      Assignee: {a.assignee || 'Unknown'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Topics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="text-pink-500" size={20} />
              <h3 className="font-semibold text-gray-800">Topics Discussed</h3>
            </div>
            {insights?.topics?.length === 0 ? (
              <p className="text-gray-400 text-sm">No topics recorded</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {insights?.topics?.map((t, i) => (
                  <span key={i} className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Send Email */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Send className="text-indigo-600" size={18} />
            Send Summary to Participants
          </h3>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}