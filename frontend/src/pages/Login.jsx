import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, ArrowRight, Loader2 } from 'lucide-react';
import { login } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginAuth, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      loginAuth(data.access_token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        {/* Gradient glow */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] -top-24 -left-24" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-emerald-400/10 blur-[100px] bottom-20 right-10" />
        
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SkillSync AI</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight mb-6">
            Welcome<br />
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">Back</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Sign in to your account and continue optimizing your hiring pipeline with AI-powered skill matching.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-emerald-400">92%</div>
            <div>
              <p className="text-sm font-semibold text-white">Avg. Match Accuracy</p>
              <p className="text-xs text-gray-500">Across 10,000+ analyses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">SkillSync AI</span>
          </div>

          <h2 className="text-3xl font-bold mb-2 tracking-tight">Sign in</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your credentials to access the dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">Email address</label>
              <input 
                type="email" id="email" required 
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-400">Password</label>
                <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Forgot password?</a>
              </div>
              <input 
                type="password" id="password" required 
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input id="remember-me" type="checkbox" className="h-4 w-4 rounded bg-white/5 border-white/20 text-emerald-500 focus:ring-emerald-500/30" />
              <label htmlFor="remember-me" className="text-sm text-gray-400">Remember me</label>
            </div>

            <button disabled={loading} type="submit" className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-black transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
