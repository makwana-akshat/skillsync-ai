import React from 'react';
import { Bell, Shield, Database, Palette, Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="glass-card rounded-3xl p-8 bg-white/80">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-indigo-500" /> Account Settings
        </h2>

        <div className="space-y-8">
          
          {/* Notifications Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-gray-500" /> Notification Preferences
            </h3>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Email Alerts</p>
                  <p className="text-sm text-gray-500">Receive emails when resumes match over 80%</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="font-semibold text-gray-800">Weekly Analytics Report</p>
                  <p className="text-sm text-gray-500">Get a summary of hiring analytics every Monday</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Database & API Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-gray-500" /> API Integration
            </h3>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Groq API Key</label>
              <div className="flex items-center gap-3">
                <input 
                  type="password" 
                  defaultValue="gsk_******************************" 
                  disabled
                  className="bg-gray-200 border border-gray-300 rounded-lg px-4 py-2 w-full text-gray-600 font-mono text-sm" 
                />
                <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Update</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Manage your LLM credentials securely via the environment settings.</p>
            </div>
          </section>

          {/* System Settings Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-gray-500" /> Interface Theme
            </h3>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex gap-4">
              <button className="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-indigo-500 bg-white rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
                <span className="font-semibold text-sm text-indigo-700">Light Mode</span>
              </button>
              <button className="flex-1 flex flex-col items-center gap-2 p-4 border border-gray-200 bg-white rounded-xl hover:border-gray-300 transition-colors opacity-50 cursor-not-allowed">
                <div className="w-8 h-8 rounded-full bg-gray-900"></div>
                <span className="font-semibold text-sm text-gray-600">Dark Mode (Coming Soon)</span>
              </button>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button className="btn-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
