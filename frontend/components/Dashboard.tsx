"use client";
import { useState } from 'react';
import { ShieldAlert, UploadCloud, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Lock, User } from 'lucide-react';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [allLogs, setAllLogs] = useState<any[]>([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 50; 

  // --- Basic Auth Logic ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      setIsLoggedIn(true);
    } else {
      alert("Wrong credentials mowa! Use admin/password.");
    }
  };

  // --- Existing Pagination Logic ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = allLogs.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(allLogs.length / rowsPerPage);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setAllLogs(data);
      setCurrentPage(1); 
    } catch (err) {
      alert("Backend disconnect ayindi!");
    } finally {
      setLoading(false);
    }
  };

  // --- 1. Login View ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600/20 p-4 rounded-full mb-4">
              <ShieldAlert className="text-blue-500 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tighter">TENEX<span className="text-blue-500">.SOC</span> LOGIN</h1>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Secure Access Gateway</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              Sign In
            </button>
          </form>
          <p className="text-center text-slate-600 text-[10px] mt-6 uppercase tracking-tight">
            Hint: admin / password
          </p>
        </div>
      </div>
    );
  }

  // --- 2. Main Dashboard View (Only shown after login) ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <nav className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-blue-500 w-8 h-8" />
          <span className="font-bold text-2xl tracking-tighter text-white">TENEX<span className="text-blue-500">.SOC</span></span>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-[10px] text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                User: <span className="text-blue-400 font-mono italic">admin</span>
            </div>
            <button onClick={() => setIsLoggedIn(false)} className="text-[10px] text-red-500 hover:underline uppercase font-bold">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        {/* Upload Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center mb-8 shadow-xl">
          <UploadCloud size={40} className="mx-auto mb-3 text-blue-500 opacity-80" />
          <h2 className="text-xl font-semibold text-white mb-1">AI Threat Detection Engine</h2>
          <p className="text-slate-400 text-sm mb-6 font-light">Analyzing 10GB+ Zscaler logs using Unsupervised Isolation Forest</p>
          
          <input type="file" id="log-file" className="hidden" onChange={handleUpload} />
          <label htmlFor="log-file" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-bold transition-all inline-block shadow-lg shadow-blue-900/20 active:scale-95">
            {loading ? "AI Analyzing Patterns..." : "Upload Zscaler Logs"}
          </label>
        </div>

        {/* Results Section */}
        {allLogs.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-700">
            <div className="flex justify-between items-center px-2">
              <p className="text-sm text-slate-400">
                Processed <span className="text-white font-bold">{allLogs.length.toLocaleString()}</span> logs
              </p>
              
              <div className="flex items-center gap-4">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-md disabled:opacity-30 hover:bg-slate-800 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-md disabled:opacity-30 hover:bg-slate-800 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-slate-700">
                  <tr>
                    <th className="p-4">Timestamp / IP</th>
                    <th className="p-4">Resource Access</th>
                    <th className="p-4 text-center">AI Verdict</th>
                    <th className="p-4 text-center">Confidence</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-800">
                  {currentRows.map((log, i) => (
                    <tr key={i} className={`transition-colors ${log.is_anomaly ? 'bg-red-500/10 hover:bg-red-500/15' : 'hover:bg-slate-800/40'}`}>
                      <td className="p-4">
                        <div className="text-[10px] font-mono text-slate-500 mb-1">{log.timestamp}</div>
                        <div className="font-medium text-slate-200">{log.source_ip}</div>
                      </td>
                      <td className="p-4">
                        <div className="truncate max-w-xs text-slate-400 text-xs mb-1">{log.url}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Risk: {log.status} | Size: {log.bytes_sent}B</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-center">
                          {log.is_anomaly ? (
                            <>
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-900/30 text-red-500 text-[10px] font-black border border-red-500/20 mb-1">
                                <AlertTriangle size={12} /> ANOMALY
                              </span>
                              <div className="text-[9px] text-red-400/80 max-w-[150px] text-center leading-tight italic">
                                {log.reason}
                              </div>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-900/30 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                              <CheckCircle size={12} /> CLEAN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {log.is_anomaly ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-red-500 h-full transition-all duration-1000" 
                                style={{ width: `${log.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{log.confidence}%</span>
                          </div>
                        ) : (
                          <div className="text-center text-slate-700 text-xs">-</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}