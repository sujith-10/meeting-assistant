import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
     const res = await loginApi(email, password);
await loginUser(res.data.access_token);
toast.success('Welcome back!');
navigate('/dashboard');

     }  catch (err) {
  console.log('CATCH ERROR:', err.response);
  console.log('STATUS:', err.response?.status);
  console.log('DETAIL:', err.response?.data);
  toast.error(err.response?.data?.detail || 'Invalid email or password');
}
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#f7f9fb', fontFamily: 'Inter, sans-serif' }}
    >
      <Toaster position="top-right" />

      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            top: '-10%', left: '-5%',
            width: '40%', height: '60%',
            background: 'rgba(216,226,255,0.25)',
            filter: 'blur(120px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: '-10%', right: '-5%',
            width: '40%', height: '60%',
            background: 'rgba(137,245,231,0.2)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      {/* Main content */}
      <main className="z-10 w-full max-w-[440px] flex flex-col gap-6">

        {/* Branding */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2">
           <div className="w-10 h-10 bg-[#0070f3] rounded-lg flex items-center justify-center shadow-sm">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M4 14h2v-4H4v4zm3 4h2V6H7v12zm3-8h2v-2h-2v2zm0 4h2v-2h-2v2zm3-1h2v-6h-2v6zm3 3h2V8h-2v8z"/>
  </svg>
</div>
            <h1
              className="text-2xl font-semibold text-[#191c1e] tracking-tight"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              MeetMind
            </h1>
          </div>
          <p className="text-sm text-[#414754] max-w-[280px]">
            Transform chaotic conversations into actionable data.
          </p>
        </div>

        {/* Login Card */}
        <section
          className="bg-white rounded-xl p-10 border border-[#c1c6d7]/30"
          style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}
        >
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className="text-3xl font-semibold text-[#191c1e] mb-1"
                style={{ fontFamily: 'Geist, sans-serif', letterSpacing: '-0.02em' }}
              >
                Welcome back
              </h2>
              <p className="text-sm text-[#414754]">Please enter your details to sign in.</p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-mono font-medium text-[#414754] uppercase tracking-wider"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-[10px] bg-white border border-[#c1c6d7] rounded-lg text-base text-[#191c1e] focus:outline-none focus:border-[#0058c3] transition-all duration-200"
                  style={{ boxShadow: 'none' }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(0,88,195,0.15)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label
                    className="text-xs font-mono font-medium text-[#414754] uppercase tracking-wider"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <span className="text-sm text-[#0058c3] cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-[10px] bg-white border border-[#c1c6d7] rounded-lg text-base text-[#191c1e] focus:outline-none focus:border-[#0058c3] transition-all duration-200"
                  style={{ boxShadow: 'none' }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(0,88,195,0.15)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 px-6 bg-[#0058c3] text-white font-semibold text-sm rounded-lg hover:bg-[#004397] active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#c1c6d7]" />
              <span className="text-xs font-mono font-medium text-[#414754] tracking-wider">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-[#c1c6d7]" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 border border-[#c1c6d7] rounded-lg text-sm font-semibold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors active:scale-[0.98]">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-[#c1c6d7] rounded-lg text-sm font-semibold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors active:scale-[0.98]">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                  <path fill="#7fba00" d="M1 13h10v10H1z"/>
                  <path fill="#ffb900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center">
          <p className="text-base text-[#414754]">
            Don't have an account?{' '}
            <span className="text-[#0058c3] font-bold cursor-pointer hover:underline">
              Create Account
            </span>
          </p>
        </footer>

        {/* Decorative element */}
        <div className="mt-10 opacity-40 pointer-events-none select-none">
          <div className="flex justify-center gap-6">
            <div className="flex flex-col gap-1">
              <div className="w-16 h-2 bg-[#c1c6d7] rounded-full" />
              <div className="w-12 h-2 bg-[#c1c6d7]/50 rounded-full" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-20 h-2 bg-[#c1c6d7]/70 rounded-full" />
              <div className="w-8 h-2 bg-[#c1c6d7]/30 rounded-full" />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}