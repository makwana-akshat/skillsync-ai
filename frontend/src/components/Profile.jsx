import React from 'react';
import { User, Mail, Shield, Key } from 'lucide-react';

export default function Profile() {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="glass-card rounded-3xl p-8 bg-white/80">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg ring-4 ring-indigo-50">
            A
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin User</h2>
            <p className="text-gray-500 font-medium mt-1">Lead Recruiter</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">Pro Plan</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <input type="text" defaultValue="Admin User" className="bg-transparent border-none outline-none w-full text-gray-800 font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <input type="email" defaultValue="admin@skillsync.ai" className="bg-transparent border-none outline-none w-full text-gray-800 font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Shield className="w-5 h-5 text-gray-400 mr-3" />
                <input type="text" defaultValue="Administrator" disabled className="bg-transparent border-none outline-none w-full text-gray-500 font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Key className="w-5 h-5 text-gray-400 mr-3" />
                <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors">Change Password</button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button className="btn-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
