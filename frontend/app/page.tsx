"use client";
import { useState } from 'react';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple basic auth for the assignment
    if (user === "admin" && pass === "admin123") {
      setIsLoggedIn(true);
    } else {
      alert("Chudu mowa, credentials thappu! (Try: admin / admin123)");
    }
  };

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-400">TENEX.AI</h1>
          <p className="text-slate-400 mt-2">Cyber Log Analyzer Login</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="admin"
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition duration-200 shadow-lg shadow-blue-900/20"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </main>
  );
}