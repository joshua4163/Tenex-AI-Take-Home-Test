"use client";
import { useState } from 'react';
import { ShieldAlert, UploadCloud, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [allLogs, setAllLogs] = useState<any[]>([]); // Mothan data ikkada untundi
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 50; // Per page ki 50 rows mathrame

  // Pagination Logic
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
      // ⚡ Backend ki request pampesthunnam
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setAllLogs(data);
      setCurrentPage(1); // Reset to first page
    } catch (err) {
      alert("Backend check chey mowa, disconnect ayinattu undi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      {/* Header */}
      <nav className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-blue-500 w-8 h-8" />
          <span className="font-bold text-2xl tracking-tighter text-white">TENEX<span className="text-blue-500">.SOC</span></span>
        </div>
        <div className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          Status: <span className="text-emerald-500">System Active</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        {/* Upload Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center mb-8 shadow-xl">
          <UploadCloud size={40} className="mx-auto mb-3 text-blue-500 opacity-80" />
          <h2 className="text-xl font-semibold text-white mb-1">High-Volume Log Analyzer</h2>
          <p className="text-slate-400 text-sm mb-6">Supports Zscaler CSV files up to 10GB (Memory Efficient)</p>
          
          <input type="file" id="log-file" className="hidden" onChange={handleUpload} />
          <label htmlFor="log-file" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-bold transition-all inline-block shadow-lg shadow-blue-900/20">
            {loading ? "AI is Analyzing Millions of Rows..." : "Upload Zscaler Logs"}
          </label>
        </div>

        {/* Results Section */}
        {allLogs.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <p className="text-sm text-slate-400">
                Found <span className="text-white font-bold">{allLogs.length.toLocaleString()}</span> entries 
                (Showing {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, allLogs.length)})
              </p>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-4">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-md disabled:opacity-30 hover:bg-slate-800 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-mono">Page {currentPage} of {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-md disabled:opacity-30 hover:bg-slate-800 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* The Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-bold tracking-widest border-b border-slate-700">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Source IP</th>
                    <th className="p-4">Destination URL</th>
                    <th className="p-4 text-center">Risk</th>
                    <th className="p-4 text-center">AI Verdict</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-800">
                  {currentRows.map((log, i) => (
                    <tr key={i} className={`transition-colors ${log.is_anomaly ? 'bg-red-500/10 hover:bg-red-500/15' : 'hover:bg-slate-800/40'}`}>
                      <td className="p-4 font-mono text-xs text-slate-500">{log.timestamp}</td>
                      <td className="p-4 font-medium text-slate-300">{log.source_ip}</td>
                      <td className="p-4 truncate max-w-xs text-slate-400">{log.url}</td>
                      <td className="p-4 text-center font-bold">{log.status}</td>
                      <td className="p-4 text-center">
                        {log.is_anomaly ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-900/30 text-red-500 text-xs font-bold border border-red-500/20">
                            <AlertTriangle size={12} /> ANOMALY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-900/30 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                            <CheckCircle size={12} /> NORMAL
                          </span>
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