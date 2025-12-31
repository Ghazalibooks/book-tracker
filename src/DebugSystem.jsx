// 🐛 COMPREHENSIVE DEBUG SYSTEM
import { useState, useEffect, useRef } from 'react';
import { Bug, Download, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

// Global debug store
export const DebugStore = {
  logs: [],
  maxLogs: 500,
  
  add(type, category, message, data = null) {
    const log = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString(),
      type, // success, error, warning, info, click, firebase
      category, // ui, auth, books, timer, shop, social, etc.
      message,
      data,
      stack: type === 'error' ? new Error().stack : null
    };
    
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Console output with color
    const colors = {
      success: 'color: #4CAF50; font-weight: bold',
      error: 'color: #F44336; font-weight: bold',
      warning: 'color: #FF9800; font-weight: bold',
      info: 'color: #2196F3; font-weight: bold',
      click: 'color: #9C27B0; font-weight: bold',
      firebase: 'color: #FF6F00; font-weight: bold'
    };
    
    console.log(
      `%c[${type.toUpperCase()}] ${category}: ${message}`,
      colors[type] || 'color: #666',
      data || ''
    );
    
    // Trigger listeners
    this.listeners.forEach(fn => fn(log));
  },
  
  listeners: [],
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  },
  
  clear() {
    this.logs = [];
    this.listeners.forEach(fn => fn(null));
  },
  
  export() {
    const data = {
      exportDate: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.logs
    };
    return JSON.stringify(data, null, 2);
  }
};

// Debug helpers
export const debug = {
  success: (category, message, data) => DebugStore.add('success', category, message, data),
  error: (category, message, data) => DebugStore.add('error', category, message, data),
  warning: (category, message, data) => DebugStore.add('warning', category, message, data),
  info: (category, message, data) => DebugStore.add('info', category, message, data),
  click: (category, message, data) => DebugStore.add('click', category, message, data),
  firebase: (category, message, data) => DebugStore.add('firebase', category, message, data)
};

// Main Debug Panel Component
export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const logsEndRef = useRef(null);
  
  useEffect(() => {
    // Subscribe to new logs
    const unsubscribe = DebugStore.subscribe((log) => {
      if (log) {
        setLogs([...DebugStore.logs]);
      } else {
        setLogs([]);
      }
    });
    
    // Initial load
    setLogs([...DebugStore.logs]);
    
    return unsubscribe;
  }, []);
  
  const exportLogs = () => {
    const data = DebugStore.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-log-${new Date().toISOString()}.json`;
    a.click();
    debug.success('debug', 'Debug log exported', { count: logs.length });
  };
  
  const clearLogs = () => {
    DebugStore.clear();
    debug.info('debug', 'Debug log cleared');
  };
  
  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.type !== filter) return false;
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  const categories = [...new Set(logs.map(l => l.category))];
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: '#F44336',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <Bug size={24} />
      </button>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: isMinimized ? 300 : 600,
      height: isMinimized ? 'auto' : 500,
      background: 'rgba(0, 0, 0, 0.95)',
      border: '2px solid #F44336',
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: 12,
        background: '#F44336',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'move'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
          <Bug size={20} />
          <strong>Debug Panel</strong>
          <span style={{ fontSize: 12, opacity: 0.8 }}>({filteredLogs.length} logs)</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}
          >
            {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}
          >
            <EyeOff size={20} />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Filters */}
          <div style={{ padding: 12, borderBottom: '1px solid #333', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                background: '#222',
                color: 'white',
                border: '1px solid #444',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12
              }}
            >
              <option value="all">All Types</option>
              <option value="success">✅ Success</option>
              <option value="error">❌ Error</option>
              <option value="warning">⚠️ Warning</option>
              <option value="info">ℹ️ Info</option>
              <option value="click">👆 Click</option>
              <option value="firebase">🔥 Firebase</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                background: '#222',
                color: 'white',
                border: '1px solid #444',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: '#222',
                color: 'white',
                border: '1px solid #444',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                flex: 1,
                minWidth: 100
              }}
            />
            
            <button
              onClick={exportLogs}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Download size={14} /> Export
            </button>
            
            <button
              onClick={clearLogs}
              style={{
                background: '#F44336',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
          
          {/* Logs */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 8,
            fontSize: 12,
            fontFamily: 'monospace'
          }}>
            {filteredLogs.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
                No logs to display
              </div>
            ) : (
              filteredLogs.map(log => (
                <LogEntry key={log.id} log={log} />
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </>
      )}
    </div>
  );
}

function LogEntry({ log }) {
  const [expanded, setExpanded] = useState(false);
  
  const typeColors = {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    click: '#9C27B0',
    firebase: '#FF6F00'
  };
  
  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    click: '👆',
    firebase: '🔥'
  };
  
  return (
    <div
      onClick={() => log.data && setExpanded(!expanded)}
      style={{
        padding: 8,
        marginBottom: 4,
        background: 'rgba(255,255,255,0.05)',
        borderLeft: `3px solid ${typeColors[log.type]}`,
        borderRadius: 4,
        cursor: log.data ? 'pointer' : 'default'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 14 }}>{typeIcons[log.type]}</span>
        <span style={{ color: '#999', fontSize: 10 }}>{log.time}</span>
        <span style={{
          background: typeColors[log.type],
          color: 'white',
          padding: '2px 6px',
          borderRadius: 3,
          fontSize: 10,
          fontWeight: 'bold'
        }}>
          {log.category}
        </span>
      </div>
      <div style={{ color: 'white', marginLeft: 22 }}>{log.message}</div>
      
      {expanded && log.data && (
        <pre style={{
          marginTop: 8,
          padding: 8,
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 4,
          color: '#4CAF50',
          fontSize: 10,
          overflow: 'auto',
          maxHeight: 200
        }}>
          {JSON.stringify(log.data, null, 2)}
        </pre>
      )}
      
      {expanded && log.stack && (
        <pre style={{
          marginTop: 8,
          padding: 8,
          background: 'rgba(255,0,0,0.1)',
          borderRadius: 4,
          color: '#F44336',
          fontSize: 9,
          overflow: 'auto',
          maxHeight: 150
        }}>
          {log.stack}
        </pre>
      )}
    </div>
  );
}

export default DebugPanel;
