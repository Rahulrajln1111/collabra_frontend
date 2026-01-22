import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Copy, Check, ChevronRight, ChevronDown, FileCode } from 'lucide-react';
import axios from '../config/axios';

const AiAssistant = ({ isOpen, onClose, files, editorManager, teamMessages }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [includeTeamChat, setIncludeTeamChat] = useState(false);
  const [selectedContextFiles, setSelectedContextFiles] = useState([]);
  const [showContextOptions, setShowContextOptions] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare context from selected files
      const contextData = selectedContextFiles.map(fileId => {
        const file = files.find(f => f.id === fileId);
        if (!file) return null;
        // Get content from Yjs doc if available, otherwise empty string (or fetch from server if needed)
        const content = editorManager.yDoc.getText(`file-${file.id}`).toString();
        return { name: file.name, content };
      }).filter(Boolean);

      const response = await axios.post('/ai/get-response', {
        prompt: userMessage.text,
        context: contextData,
        history: messages,
        teamChat: includeTeamChat ? teamMessages : [],
        model: selectedModel
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.data.text }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedContextFiles(prev => 
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  // Simple Markdown Renderer
  const renderMessageContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/^```(\w*)\n([\s\S]*?)```$/);
        const code = match ? match[2] : part.slice(3, -3);
        const lang = match ? match[1] : '';
        return <CodeBlock key={index} code={code} lang={lang} />;
      }
      // Basic formatting for bold and headings
      return (
        <div key={index} className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ 
          __html: part
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-2 mb-1 text-cyan-300">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3 mb-2 text-cyan-400">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-3 text-cyan-500">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
            .replace(/\n/g, '<br />')
        }} />
      );
    });
  };

  return (
    <div className={`fixed top-0 left-0 h-full w-1/2 bg-slate-900 border-r border-white/10 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">AI Assistant</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      <div className="p-4 border-b border-white/10 bg-slate-800/50 space-y-4">
        <div className="flex items-center space-x-4">
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
          </select>

          <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={includeTeamChat} 
              onChange={(e) => setIncludeTeamChat(e.target.checked)}
              className="rounded bg-slate-900 border-white/20 text-cyan-500 focus:ring-cyan-500"
            />
            <span>Include Team Chat</span>
          </label>
        </div>

        {/* Context Selection */}
        <div>
          <button 
            onClick={() => setShowContextOptions(!showContextOptions)}
            className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showContextOptions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>Select Context Files ({selectedContextFiles.length})</span>
          </button>
          
          {showContextOptions && (
            <div className="mt-2 max-h-32 overflow-y-auto bg-slate-900 rounded-lg border border-white/10 p-2 space-y-1">
              {files.map(file => (
                <label key={file.id} className="flex items-center space-x-2 p-1 hover:bg-white/5 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedContextFiles.includes(file.id)}
                    onChange={() => toggleFileSelection(file.id)}
                    className="rounded bg-slate-800 border-white/20 text-cyan-500"
                  />
                  <FileCode className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300 truncate">{file.name}</span>
                </label>
              ))}
              {files.length === 0 && <p className="text-xs text-slate-500 p-1">No files available</p>}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-br-none' 
                : 'bg-slate-800 border border-white/10 text-slate-200 rounded-bl-none'
            }`}>
              {renderMessageContent(msg.text)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-white/10 rounded-2xl rounded-bl-none p-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-slate-900">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI about your code..."
            className="w-full bg-slate-800 border border-white/20 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none h-[60px]"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-white/10 bg-black/50">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs text-slate-400 font-mono">{lang || 'code'}</span>
        <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default AiAssistant;