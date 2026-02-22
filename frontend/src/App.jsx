import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  Sparkles, 
  History, 
  Copy, 
  Download, 
  Loader2, 
  ChevronRight, 
  Trash2,
  Globe
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('medium');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('search_history') || '[]');
    setHistory(saved);
  }, []);

  const saveToHistory = (newRecord) => {
    const updated = [newRecord, ...history.filter(h => h.topic !== newRecord.topic)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));
  };

  const handleSubmit = async (e, customTopic = null, customDepth = null) => {
    if (e) e.preventDefault();
    const activeTopic = customTopic || topic;
    const activeDepth = customDepth || depth;

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/api/search/', {
        topic: activeTopic,
        depth: activeDepth,
      });
      setSummary(response.data.summary);
      saveToHistory({ topic: activeTopic, depth: activeDepth, summary: response.data.summary });
    } catch (err) {
      setError(err.response?.data?.error || 'The research agent encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Container with max width and auto margins to center */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: History (3/12 = 25% on large screens) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="flex items-center gap-2 font-bold mb-4 text-slate-600 dark:text-slate-400">
              <History size={18} /> Recent Research
            </h2>
            <div className="space-y-2">
              {history.length === 0 && <p className="text-sm text-slate-400 italic">No recent searches</p>}
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(item.topic);
                    setDepth(item.depth);
                    setSummary(item.summary);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm truncate group flex justify-between items-center"
                >
                  <span>{item.topic}</span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              {history.length > 0 && (
                <button 
                  onClick={() => {setHistory([]); localStorage.removeItem('search_history')}}
                  className="mt-4 flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                >
                  <Trash2 size={12} /> Clear History
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN: Search & Content (9/12 = 75% on large screens) */}
        <main className="lg:col-span-9 space-y-6">
          {/* Hero Header */}
          <header className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent mb-2 leading-tight">
              Agentic Insight Scraper
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Deep web research & summarization powered by Tavily + Gemini
            </p>
          </header>

          {/* Search Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl shadow-blue-500/5 border border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="What would you like to research today?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="md:w-48">
                  <select 
                    value={depth} 
                    onChange={(e) => setDepth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="less">Quick Overview</option>
                    <option value="medium">Standard Depth</option>
                    <option value="high">Deep Technical</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? 'Analyzing...' : 'Research'}
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 rounded-xl text-sm"
              >
                ❌ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Area */}
          <div className="relative min-h-[400px]">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="grid grid-cols-3 gap-4 py-4">
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
            ) : summary ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Research Results</h2>
                    <p className="text-sm text-slate-500 capitalize">{depth} intensity scan complete</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                      title="Copy to Clipboard"
                    >
                      <Copy size={20} />
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>

                <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </article>

                <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                   <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                     <Globe size={16} /> Data Verification
                   </h3>
                   <p className="text-xs text-blue-600 dark:text-blue-400/80">
                     This summary was synthesized from multiple real-time web sources. AI models can occasionally hallucinate; please verify critical technical details.
                   </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-4 pt-20">
                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Search size={48} />
                </div>
                <p className="text-lg">Enter a topic to begin research</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;