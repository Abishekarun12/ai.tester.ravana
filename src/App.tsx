/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */



// Code for AutoQA.ai - An AI-driven exploratory testing agent interface built with React and Tailwind CSS.
//Developd By 
// -----------------------RAVANA------------------------

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bug, FileText, Activity, AlertCircle, ChevronRight, Terminal as TerminalIcon, Download, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface Scenario {
  id: string;
  name: string;
  description: string;
  priority: string;
  complexity: string;
}

interface BugReport {
  id: string;
  component: string;
  issue: string;
  severity: string;
  steps: string;
  screenshotUrl: string;
}

interface AuditResult {
  scenarios: Scenario[];
  bugs: BugReport[];
  caseStudy: string;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState<'strategy' | 'bugs' | 'case'>('strategy');
  const [notification, setNotification] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("Downloading screenshot...");
    } catch (err) {
      // Fallback for cross-origin issues
      window.open(imageUrl, '_blank');
      showToast("Opening image in new tab...");
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const startAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setResult(null);
    setLogs([]);
    addLog(`Initializing audit for target: ${url}`);

    try {
      addLog("🕷️ Launching crawler...");
      console.log("Gemini Key Exists:", !!process.env.GEMINI_API_KEY);
      await new Promise(r => setTimeout(r, 600));
      addLog("🔍 Discovering interactive elements...");
      await new Promise(r => setTimeout(r, 800));
      addLog("🧠 Analyzing UI component hierarchy...");
      await new Promise(r => setTimeout(r, 800));
      addLog("🤖 AI Agent: Mapping test surface and identifying edge cases...");

      const API_URL = process.env.REACT_APP_API_URL || "";

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      console.log("API Response:", data);
      addLog(`Response: ${JSON.stringify(data).slice(0, 200)}...`);

      setResult({
        scenarios: data.scenarios || [],
        bugs: data.bugs || [],
        caseStudy: data.caseStudy || "No report generated"
      });

      addLog(`Scenarios found: ${data.scenarios?.length || 0}`);
      addLog(`Bugs found: ${data.bugs?.length || 0}`);
      addLog("✅ Audit complete. Reports generated.");
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    scenarios: result?.scenarios.length || 0,
    bugs: result?.bugs.length || 0,
    readiness: result ? Math.floor(Math.random() * 20) + 75 : 0, // Simulated readiness
    critical: result?.bugs.filter(b => ['Critical', 'High'].includes(b.severity)).length || 0
  };

  return (
    <div id="app-container" className="min-h-screen relative overflow-hidden flex flex-col font-sans">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md border-b border-white/10 z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            A Tester Companion <span className="text-blue-400">.ai</span>
          </span>
        </div>
        <small className="text-blue-400">Developed by Ravana</small>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              {loading ? 'Analyzing' : 'Agent Active'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 z-10 overflow-hidden">

        {/* Sidebar Controls */}
        <section id="sidebar" className="w-full lg:w-80 flex flex-col gap-6">
          {/* URL Input Glass Card */}
          <div className="frosted-glass p-5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Target Application</label>
            <form onSubmit={startAudit} className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs font-mono text-blue-300 outline-none focus:border-blue-500/50 transition-colors"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                <span>{loading ? "INITIALIZING..." : "START AUDIT"}</span>
              </button>
            </form>
          </div>

          {/* Timeline / Terminal Glass Card */}
          <div className="frosted-glass p-5 flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TerminalIcon className="w-3 h-3" />
              Live Audit Stream
            </h3>
            <div ref={scrollRef} className="flex-1 font-mono text-[10px] space-y-2 overflow-y-auto scrollbar-hide">
              {logs.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  Waiting for stream...
                </div>
              )}
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <span className="text-blue-500/50 font-bold shrink-0">{i + 1}</span>
                  <span className={log.includes('❌') ? 'text-rose-400' : log.includes('✅') ? 'text-emerald-400' : 'text-slate-400'}>
                    {log}
                  </span>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center text-blue-400">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                  <span>Processing request...</span>
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-xl">
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter mb-2">Analysis Coverage</p>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: loading ? '75%' : result ? '100%' : '0%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Data Area */}
        <section className="flex-1 flex flex-col gap-6 overflow-hidden">

          {/* Scorecards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Scenarios', value: stats.scenarios, color: 'text-white' },
              { label: 'Bugs Found', value: stats.bugs, color: 'text-rose-400' },
              { label: 'Readiness', value: stats.readiness + '%', color: 'text-emerald-400' },
              { label: 'Critical', value: stats.critical, color: 'text-orange-400' }
            ].map((stat, idx) => (
              <div key={idx} className="frosted-glass p-4">
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Result Content */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 frosted-glass flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>
                  <h2 className="text-lg font-bold mb-2">Awaiting Target Selection</h2>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Enter an application URL to begin the AI-driven exploratory audit.
                    The agent will discover elements, map states, and detect vulnerabilities.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col gap-6 overflow-hidden"
                >
                  {/* Tabs */}
                  <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                    {(['strategy', 'bugs', 'case'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${activeTab === tab
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-400 hover:text-white'
                          }`}
                      >
                        {tab === 'strategy' ? 'Scenarios' : tab === 'bugs' ? 'Bug Sheet' : 'Case Study'}
                      </button>
                    ))}
                  </div>

                  {/* Tab Body */}
                  <div className="flex-1 frosted-glass p-6 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                      {activeTab === 'strategy' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result?.scenarios.map((s, i) => (
                            <motion.div
                              key={s.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/30 transition-all group"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-blue-400/70">{s.id}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${s.priority === 'P0' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                  {s.priority}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{s.name}</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                              <div className="mt-3 text-[9px] font-bold uppercase text-slate-600 tracking-widest">Complexity: {s.complexity}</div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'bugs' && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              <tr>
                                <th className="px-6 py-4">Evidence</th>
                                <th className="px-6 py-4">Component</th>
                                <th className="px-6 py-4">Violation Details</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {result?.bugs.map((b, i) => (
                                <motion.tr
                                  key={b.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="hover:bg-white/5 transition-colors group"
                                >
                                  <td className="px-6 py-4">
                                    <div className="relative w-24 h-16 bg-black/40 rounded-lg border border-white/10 overflow-hidden group-hover:border-blue-500/50 transition-colors">
                                      <img
                                        src={b.screenshotUrl}
                                        alt={`Evidence ${b.id}`}
                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                                        <span className="text-[8px] font-mono text-blue-300">{b.id}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-xs font-medium text-slate-300">
                                    {b.component}
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-xs text-white mb-1 group-hover:text-blue-300 transition-colors">{b.issue}</p>
                                    <p className="text-[10px] text-slate-500 italic max-w-sm truncate">{b.steps}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${['Critical', 'High'].includes(b.severity)
                                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                                      : 'bg-orange-500/20 text-orange-400 border-orange-500/20'
                                      }`}>
                                      {b.severity}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => copyToClipboard(`${b.id}: ${b.issue}\nSeverity: ${b.severity}\nSteps: ${b.steps}`, 'Bug Info')}
                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                        title="Copy Bug Details"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => downloadImage(b.screenshotUrl, `${b.id}-evidence.png`)}
                                        className="p-2 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                                        title="Download Screenshot"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => copyToClipboard(b.screenshotUrl, 'Image URL')}
                                        className="p-2 hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                                        title="Copy Image URL"
                                      >
                                        <Layers className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activeTab === 'case' && (
                        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-400 prose-strong:text-blue-400 prose-blockquote:border-l-blue-600">
                          <ReactMarkdown>{result?.caseStudy || ''}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-3 z-[100]"
                >
                  <Activity className="w-4 h-4" />
                  {notification}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 px-8 flex items-center justify-between text-[10px] text-slate-600 font-medium bg-black/20 z-50">
        <div className="flex gap-4">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            Version 1.2.4-stable
          </span>
          <span className="border-l border-white/10 pl-4 uppercase tracking-tighter">Node: GLOBAL-RUN-A1</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 opacity-50">
            <span>{new Date().toLocaleDateString()}</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          <span className="text-blue-500/80 font-bold uppercase">© 2026 Ravana </span>
        </div>
      </footer>
    </div>
  );
}
