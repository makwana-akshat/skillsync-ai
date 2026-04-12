import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, LayoutDashboard, FileSearch, BarChart2, Users, LogOut, Bell, Settings, User, History, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

import Overview from '../components/Overview';
import AnalyzeResume from '../components/AnalyzeResume';
import RankResumes from '../components/RankResumes';
import BatchMatch from '../components/BatchMatch';
import AnalysisHistory from '../components/AnalysisHistory';
import Profile from '../components/Profile';
import SettingsComponent from '../components/Settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Allow child components to switch tabs and pass data
  const [analyzeData, setAnalyzeData] = useState(null);

  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler for "Analyze This Resume" from RankResumes
  const handleAnalyzeFromRank = (data) => {
    setAnalyzeData(data);
    setActiveTab('analyze');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <Overview setTab={setActiveTab} />;
      case 'analyze': return <AnalyzeResume prefillData={analyzeData} onClearPrefill={() => setAnalyzeData(null)} />;
      case 'rank': return <RankResumes onAnalyzeResume={handleAnalyzeFromRank} />;
      case 'match': return <BatchMatch />;
      case 'history': return <AnalysisHistory />;
      case 'profile': return <Profile />;
      case 'settings': return <SettingsComponent />;
      default: return <Overview setTab={setActiveTab} />;
    }
  };

  const titles = {
    'overview': 'Dashboard Overview',
    'analyze': 'Single Resume Analysis',
    'rank': 'Rank Resumes',
    'match': 'Advanced Matching Overview',
    'history': 'Analysis History',
    'profile': 'My Profile',
    'settings': 'Account Settings'
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0f] text-gray-900 dark:text-gray-100 font-sans h-screen flex overflow-hidden transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#12121a] border-r border-gray-200 dark:border-white/5 flex flex-col justify-between h-full shadow-sm z-10 shrink-0 transition-colors">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="bg-gray-900 dark:bg-emerald-500 text-white p-1.5 rounded-lg">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">SkillSync AI</span>
            </div>
          </div>
          
          <nav className="p-4 space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-2">Main</p>
            
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>

            <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-6">Features</p>
            
            <button 
              onClick={() => { setActiveTab('analyze'); setAnalyzeData(null); }} 
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'analyze' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <FileSearch className="w-4 h-4" />
              Single Analysis
            </button>
            
            <button 
              onClick={() => setActiveTab('rank')} 
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'rank' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <BarChart2 className="w-4 h-4" />
              Rank Resumes
            </button>
            
            <button 
              onClick={() => setActiveTab('match')} 
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'match' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              Match Overview
            </button>

            <button 
              onClick={() => setActiveTab('history')} 
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-white/5">
          <Link to="/login" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-[#0a0a0f] transition-colors">
        <header className="h-16 bg-white dark:bg-[#12121a] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 shadow-sm z-20 shrink-0 relative transition-colors">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{titles[activeTab]}</h1>
          <div className="flex items-center gap-3" ref={menuRef}>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Button */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className={`p-2 transition-colors rounded-full relative ${showNotifications ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#12121a]"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a1a2e] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 animate-fade-in py-2">
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer">Mark all as read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border-l-4 border-emerald-500 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">New match generated</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alice Smith matched 92% for Frontend Engineer.</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 mins ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">System Update</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SkillSync AI has been updated to v1.2</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative">
              <button 
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-400 to-green-500 flex items-center justify-center text-black font-bold text-sm shadow-md hover:scale-105 transition-transform border-2 border-white dark:border-[#12121a] ring-2 ring-transparent hover:ring-emerald-100 dark:hover:ring-emerald-500/20 outline-none"
              >
                A
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1a2e] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 animate-fade-in py-2">
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-white/5 mb-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Admin User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">admin@skillsync.ai</p>
                  </div>
                  
                  <button 
                    onClick={() => { setActiveTab('profile'); setShowProfile(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-white/5 hover:text-emerald-700 dark:hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </button>
                  <button 
                    onClick={() => { setActiveTab('settings'); setShowProfile(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-white/5 hover:text-emerald-700 dark:hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Account Settings
                  </button>
                  
                  <div className="border-t border-gray-50 dark:border-white/5 mt-1 pt-1">
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}
