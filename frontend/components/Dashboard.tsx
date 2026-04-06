"use client";
import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  UploadCloud, 
  LogOut, 
  CheckCircle, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  User, 
  Lock 
} from 'lucide-react';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  
  // Data States
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 1000; 

  useEffect(() => {
    setIsMounted(true);
    if (sessionStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      sessionStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
    } else {
      alert("Wrong Credentials! Use admin / password.");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setLogs(data);
      setCurrentPage(1); 
    } catch (err) {
      alert("Backend error! Make sure Python server is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  // --- PAGINATION CALCULATIONS ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = logs.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(logs.length / rowsPerPage);

  // --- LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Animated Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl mb-5 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <ShieldAlert className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              Tenex<span className="text-blue-500">.SOC</span>
            </h1>
            <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold opacity-70">
              Threat Intelligence Gateway
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group relative">
              <User className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>

            <div className="group relative">
              <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-purple-500 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)] active:scale-95 uppercase tracking-widest text-sm"
            >
              Authorize Access
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold italic">
                Demo: <span className="text-blue-400">admin</span> / <span className="text-purple-400">password</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <nav className="flex items-center justify-between px-10 py-5 bg-[#0f172a]/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500" />
          <span className="font-black text-xl tracking-tighter uppercase italic">Sentinel<span className="text-blue-500">Flow</span></span>
        </div>
        <button onClick={() => { sessionStorage.clear(); window.location.reload(); }} className="text-xs font-bold text-slate-500 hover:text-red-400 flex items-center gap-2 uppercase tracking-widest transition-colors">
          <LogOut size={14} /> Logout
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-[#0f172a] border-2 border-dashed border-blue-500/30 rounded-[2.5rem] p-12 flex flex-col items-center justify-center mb-10 shadow-2xl hover:border-blue-500/60 transition-all">
          <UploadCloud size={48} className="text-blue-400 mb-4" />
          <input type="file" id="log-file" className="hidden" onChange={handleUpload} />
          <label htmlFor="log-file" className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-full font-black tracking-widest transition-all shadow-lg active:scale-95">
            {loading ? "ANALYZING..." : "UPLOAD LOGS"}
          </label>
        </div>

        {logs.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-700">
            {/* --- NAVIGATION BUTTONS --- */}
            <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Logs: <span className="text-blue-400">{logs.length.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-sm font-mono font-bold">
                  PAGE {currentPage} / {totalPages}
                </span>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1e293b]/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                      <th className="p-5">Timestamp</th>
                      <th className="p-5">Source IP</th>
                      <th className="p-5">Resource</th>
                      <th className="p-5 text-center">AI Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {currentRows.map((log, i) => (
                      <tr key={i} className={`border-b border-slate-800/50 transition-all ${log.is_anomaly ? 'bg-red-500/10 hover:bg-red-500/20' : 'hover:bg-slate-800/40'}`}>
                        <td className="p-5 font-mono text-xs text-slate-400">{log.timestamp}</td>
                        <td className="p-5 font-bold text-blue-100">{log.source_ip}</td>
                        <td className="p-5 truncate max-w-xs text-slate-400 italic">{log.url}</td>
                        <td className="p-5 text-center">
                          {log.is_anomaly ? (
                            <span className="text-red-500 font-black text-[10px] bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 uppercase tracking-tighter inline-block animate-pulse">
                               HIGH ANOMALY
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold text-[10px] opacity-60">
                               SECURE
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Bottom Info */}
            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              Showing logs {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, logs.length)}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}