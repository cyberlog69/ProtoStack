'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Radio, Send, Power, ArrowUpRight, ArrowDownLeft, Zap, Terminal, AlertTriangle } from 'lucide-react';

interface WebSocketMessage {
  id: string;
  type: 'sent' | 'received' | 'system';
  text: string;
  timestamp: string;
  opcode: string;
}

type Mode = 'simulated' | 'live';

const LIVE_ECHO_URL = 'wss://echo.websocket.events';
const PING_PROBE = '__protostack_ping__';

export default function WebSocketSandbox() {
  const [mode, setMode] = useState<Mode>('simulated');
  const [isConnected, setIsConnected] = useState(false);
  const [inputMessage, setInputMessage] = useState(
    '{"type": "chat", "user": "Engineer", "msg": "Hello WebSocket!"}',
  );
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const pingStartRef = useRef<{ startedAt: number } | null>(null);

  const addMessage = (
    type: WebSocketMessage['type'],
    text: string,
    opcode = '0x1 TEXT',
  ) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setMessages((previous) => [
      {
        id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        text,
        timestamp: timeStr,
        opcode,
      },
      ...previous,
    ].slice(0, 40));
  };

  const closeSocket = () => {
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket && socket.readyState <= WebSocket.OPEN) socket.close(1000, 'Normal closure');
  };

  useEffect(() => {
    return () => {
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket && socket.readyState <= WebSocket.OPEN) socket.close();
    };
  }, []);

  const handleConnect = () => {
    if (isConnected) {
      if (mode === 'live') closeSocket();
      setIsConnected(false);
      addMessage('system', 'Session closed by the user.', mode === 'live' ? '0x8 CLOSE' : 'SIM');
      return;
    }

    if (mode === 'simulated') {
      setIsConnected(true);
      addMessage('system', 'Simulated duplex session opened locally. No WebSocket connection was created.', 'SIM');
      return;
    }

    addMessage(
      'system',
      `Opening ${LIVE_ECHO_URL}. The browser sends an HTTP Upgrade request; the server decides whether to accept it.`,
      'UPGRADE',
    );

    try {
      const socket = new WebSocket(LIVE_ECHO_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        addMessage('system', 'Live socket open: the server accepted the WebSocket upgrade.', '0x1 TEXT');
      };

      socket.onmessage = (event) => {
        const data = typeof event.data === 'string' ? event.data : '[non-text frame]';
        const pendingPing = pingStartRef.current;

        if (pendingPing && data.includes(PING_PROBE)) {
          const latency = Math.round(performance.now() - pendingPing.startedAt);
          pingStartRef.current = null;
          setPingLatency(latency);
          addMessage('received', `Echo returned in ${latency} ms (application-level probe).`, '0x1 TEXT');
          return;
        }

        addMessage('received', data, '0x1 TEXT');
      };

      socket.onerror = () => {
        addMessage(
          'system',
          'Live socket error. The connection is not open; check the network or try simulated mode.',
          'ERROR',
        );
      };

      socket.onclose = (event) => {
        setIsConnected(false);
        socketRef.current = null;
        addMessage(
          'system',
          `Live socket closed (code ${event.code}${event.reason ? `: ${event.reason}` : ''}).`,
          '0x8 CLOSE',
        );
      };
    } catch {
      socketRef.current = null;
      addMessage('system', 'Could not create a WebSocket connection in this browser.', 'ERROR');
    }
  };

  const handleModeChange = (nextMode: Mode) => {
    if (nextMode === mode) return;
    if (isConnected) {
      if (mode === 'live') closeSocket();
      setIsConnected(false);
      addMessage('system', 'Session closed because the mode changed.', 'SIM');
    }
    setPingLatency(null);
    pingStartRef.current = null;
    setMode(nextMode);
  };

  const handleSend = (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = inputMessage.trim();
    if (!text || !isConnected) return;

    addMessage('sent', text, mode === 'live' ? '0x1 TEXT (masked)' : 'SIM');

    if (mode === 'live') {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        addMessage('system', 'Socket is not open. Message was not transmitted.', 'ERROR');
        return;
      }
      socket.send(text);
      return;
    }

    window.setTimeout(() => {
      addMessage('received', `Simulated echo: ${text}`, 'SIM');
    }, 40);
  };

  const handlePing = () => {
    if (!isConnected) return;

    if (mode === 'simulated') {
      const started = performance.now();
      addMessage('sent', 'Simulated application probe.', 'SIM');
      window.setTimeout(() => {
        const latency = Math.round(performance.now() - started);
        setPingLatency(latency);
        addMessage('received', `Simulated echo returned in ${latency} ms.`, 'SIM');
      }, 35);
      return;
    }

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      addMessage('system', 'Socket is not open. Probe was not sent.', 'ERROR');
      return;
    }

    // The browser WebSocket API cannot send raw control frames. This is an
    // application-level probe that measures the echo round-trip instead.
    pingStartRef.current = { startedAt: performance.now() };
    socket.send(PING_PROBE);
    addMessage('sent', 'Application-level probe sent (not a protocol PING frame).', '0x1 TEXT');
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            WebSocket Duplex Terminal
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                mode === 'live'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {mode === 'live' ? 'Live echo server' : 'Simulated'}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Simulated mode runs entirely in the browser. Live mode opens a real socket to{' '}
            <code className="text-slate-300">{LIVE_ECHO_URL}</code>; frames and errors are reported as received.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center" role="group" aria-label="WebSocket mode">
            <button
              type="button"
              onClick={() => handleModeChange('simulated')}
              aria-pressed={mode === 'simulated'}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                mode === 'simulated' ? 'bg-amber-500/20 text-amber-200' : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulated
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('live')}
              aria-pressed={mode === 'live'}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                mode === 'live' ? 'bg-emerald-500/20 text-emerald-200' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live
            </button>
          </div>

          {pingLatency !== null && (
            <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              RTT: {pingLatency}ms
            </span>
          )}

          <button
            type="button"
            onClick={handleConnect}
            aria-pressed={isConnected}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
              isConnected
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
            }`}
          >
            <Power className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isConnected ? 'Disconnect' : 'Connect Socket'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="ws-message" className="sr-only">
          WebSocket message
        </label>
        <input
          id="ws-message"
          type="text"
          value={inputMessage}
          onChange={(event) => setInputMessage(event.target.value)}
          disabled={!isConnected}
          placeholder={isConnected ? 'Type a text frame to transmit…' : 'Connect the socket first'}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handlePing}
          disabled={!isConnected}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-400" aria-hidden="true" />
          <span>Probe</span>
        </button>

        <button
          type="submit"
          disabled={!isConnected || !inputMessage.trim()}
          className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/30"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Send Frame</span>
        </button>
      </form>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs h-[280px] overflow-y-auto space-y-2" aria-live="polite">
        {messages.length === 0 ? (
          <p className="text-slate-500">
            No frames yet. {mode === 'simulated' ? 'Connect the simulated session' : 'Connect the live socket'} to start.
          </p>
        ) : (
          messages.map((message) => {
            let badgeColor = 'bg-slate-800 text-slate-400';
            let textColor = 'text-slate-300';
            let icon = <Terminal className="w-3.5 h-3.5" aria-hidden="true" />;

            if (message.type === 'sent') {
              badgeColor = 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
              textColor = 'text-indigo-200';
              icon = <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />;
            } else if (message.type === 'received') {
              badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
              textColor = 'text-emerald-300 font-bold';
              icon = <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />;
            } else if (message.opcode === 'ERROR') {
              badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
              textColor = 'text-rose-200';
              icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />;
            }

            return (
              <div key={message.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 gap-2">
                  <span className={`px-2 py-0.5 rounded flex items-center gap-1 font-bold ${badgeColor}`}>
                    {icon}
                    {message.type.toUpperCase()} • {message.opcode}
                  </span>
                  <span>{message.timestamp}</span>
                </div>
                <div className={`text-xs break-all pl-1 ${textColor}`}>{message.text}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
