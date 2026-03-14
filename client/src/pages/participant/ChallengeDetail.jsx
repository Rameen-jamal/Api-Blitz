import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../../lib/api';
import axios from 'axios';
import {
  ArrowLeft, Send, Copy, Check, X, Plus, Trash2, Flag,
  Clock, Target, Users, AlertCircle, CheckCircle
} from 'lucide-react';

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const methodColors = {
  GET: 'text-green-400',
  POST: 'text-yellow-400',
  PUT: 'text-blue-400',
  DELETE: 'text-red-400',
  PATCH: 'text-purple-400',
};

const ChallengeDetail = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('{\n  \n}');
  const [response, setResponse] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [sending, setSending] = useState(false);
  const [flag, setFlag] = useState('');
  const [flagResult, setFlagResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await api.get(`/challenges/${id}`);
        setChallenge(data.data);
        setUrl(data.data.apiEndpoint);
      } catch (err) { console.error('Failed to fetch challenge:', err); }
      finally { setLoading(false); }
    };
    fetchChallenge();
  }, [id]);

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (index) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const sendRequest = async () => {
    setSending(true); setResponse(null);
    const start = Date.now();
    try {
      const headerObj = {};
      headers.forEach(h => { if (h.key.trim()) headerObj[h.key.trim()] = h.value; });
      const config = { method: method.toLowerCase(), url, headers: headerObj, timeout: 30000 };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        try { config.data = JSON.parse(body); } catch { config.data = body; }
      }
      const res = await axios(config);
      setResponseTime(Date.now() - start);
      setResponse({ status: res.status, statusText: res.statusText, data: res.data, headers: res.headers });
    } catch (err) {
      setResponseTime(Date.now() - start);
      if (err.response) {
        setResponse({ status: err.response.status, statusText: err.response.statusText, data: err.response.data, headers: err.response.headers });
      } else {
        setResponse({ status: 0, statusText: 'Error', data: { error: err.message }, headers: {} });
      }
    } finally { setSending(false); }
  };

  const submitFlag = async () => {
    if (!flag.trim()) return;
    setSubmitting(true); setFlagResult(null);
    try {
      const { data } = await api.post('/submissions', { challengeId: id, flag: flag.trim() });
      setFlagResult(data.data);
    } catch (err) {
      setFlagResult({ isCorrect: false, message: err.response?.data?.message || 'Submission failed' });
    } finally { setSubmitting(false); }
  };

  const copyCurl = () => {
    const headerObj = {};
    headers.forEach(h => { if (h.key.trim()) headerObj[h.key.trim()] = h.value; });
    let curl = `curl -X ${method} '${url}'`;
    Object.entries(headerObj).forEach(([k, v]) => { curl += ` -H '${k}: ${v}'`; });
    if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) { curl += ` -d '${body}'`; }
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>);
  }
  if (!challenge) {
    return (<div className="flex-1 flex items-center justify-center text-gray-500">Challenge not found</div>);
  }

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-amber-500/20 text-amber-400',
    hard: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button */}
      <Link to="/challenges" className="inline-flex items-center gap-1 text-gray-500 hover:text-green-400 transition-colors mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Back to Challenges
      </Link>

      {/* Challenge Header */}
      <div className="glass-card-static rounded-xl p-6 mb-6 animate-fade-in-up">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-teko text-3xl font-bold text-white mb-2 tracking-wide">{challenge.title}</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Target className="h-3.5 w-3.5" />{challenge.category}
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Users className="h-3.5 w-3.5" />{challenge.solvedBy} solved
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400 font-mono">{challenge.points}<span className="text-lg text-green-500/60 ml-1">pts</span></div>
        </div>
        <p className="text-gray-400 whitespace-pre-wrap text-sm leading-relaxed">{challenge.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Client */}
        <div className="space-y-4">
          <div className="glass-card-static rounded-xl p-6 animate-fade-in-up stagger-1">
            <h2 className="font-teko text-xl font-semibold text-white mb-4 tracking-wide">API CLIENT</h2>

            {/* Method + URL */}
            <div className="flex gap-2 mb-4">
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className={`px-3 py-2.5 glass-input rounded-lg font-mono text-sm font-semibold focus:outline-none ${methodColors[method]}`}>
                {methods.map(m => (<option key={m} value={m}>{m}</option>))}
              </select>
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter URL"
                className="flex-1 px-4 py-2.5 glass-input rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none" />
              <button onClick={sendRequest} disabled={sending || !url}
                className="px-4 py-2.5 btn-green rounded-lg flex items-center gap-2 text-sm tracking-wide">
                <Send className="h-4 w-4" />{sending ? 'SENDING...' : 'SEND'}
              </button>
            </div>

            {/* Headers */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Headers</label>
                <button onClick={addHeader} className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors">
                  <Plus className="h-3 w-3" />Add
                </button>
              </div>
              <div className="space-y-2">
                {headers.map((header, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={header.key} onChange={(e) => updateHeader(i, 'key', e.target.value)} placeholder="Key"
                      className="flex-1 px-3 py-1.5 glass-input rounded text-white text-sm font-mono placeholder-gray-600 focus:outline-none" />
                    <input type="text" value={header.value} onChange={(e) => updateHeader(i, 'value', e.target.value)} placeholder="Value"
                      className="flex-1 px-3 py-1.5 glass-input rounded text-white text-sm font-mono placeholder-gray-600 focus:outline-none" />
                    <button onClick={() => removeHeader(i)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Body (JSON)</label>
                <div className="border border-green-500/10 rounded-lg overflow-hidden">
                  <Editor height="200px" language="json" theme="vs-dark" value={body} onChange={(val) => setBody(val || '')}
                    options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'off', scrollBeyondLastLine: false, padding: { top: 10 }, automaticLayout: true }} />
                </div>
              </div>
            )}

            {/* Copy as cURL */}
            <button onClick={copyCurl} className="text-xs text-gray-500 hover:text-green-400 flex items-center gap-1 transition-colors">
              {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied!' : 'Copy as cURL'}
            </button>
          </div>

          {/* Flag Submission */}
          <div className="glass-card-static rounded-xl p-6 animate-fade-in-up stagger-2">
            <h2 className="font-teko text-xl font-semibold text-white mb-4 tracking-wide flex items-center gap-2">
              <Flag className="h-5 w-5 text-green-400" />SUBMIT FLAG
            </h2>
            <div className="flex gap-2">
              <input type="text" value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="Enter the flag..."
                className="flex-1 px-4 py-2.5 glass-input rounded-lg text-white font-mono placeholder-gray-600 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && submitFlag()} />
              <button onClick={submitFlag} disabled={submitting || !flag.trim()}
                className="px-6 py-2.5 btn-green rounded-lg font-medium tracking-wide text-sm">
                {submitting ? 'CHECKING...' : 'SUBMIT'}
              </button>
            </div>
            {flagResult && (
              <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm animate-fade-in ${
                flagResult.isCorrect ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {flagResult.isCorrect ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                {flagResult.message}
                {flagResult.pointsEarned && (<span className="ml-auto font-semibold font-mono">+{flagResult.pointsEarned} pts</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Response Panel */}
        <div className="glass-card-static rounded-xl p-6 animate-fade-in-up stagger-3">
          <h2 className="font-teko text-xl font-semibold text-white mb-4 tracking-wide">RESPONSE</h2>
          {!response ? (
            <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
              Send a request to see the response
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <span className={`text-sm font-semibold px-2.5 py-1 rounded ${
                  response.status >= 200 && response.status < 300 ? 'bg-green-500/20 text-green-400'
                    : response.status >= 400 ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {response.status} {response.statusText}
                </span>
                {responseTime && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />{responseTime}ms
                  </span>
                )}
              </div>
              <div className="border border-green-500/10 rounded-lg overflow-hidden">
                <Editor height="400px" language="json" theme="vs-dark"
                  value={typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : String(response.data)}
                  options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'off', scrollBeyondLastLine: false, padding: { top: 10 }, automaticLayout: true, wordWrap: 'on' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
