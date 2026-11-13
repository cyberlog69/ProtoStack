'use client';

import React, { useState } from 'react';
import { Cpu, Server, Smartphone, Send, Radio, Check, RefreshCw } from 'lucide-react';

interface MqttMessage {
  id: string;
  topic: string;
  payload: string;
  qos: number;
  timestamp: string;
  sender: string;
}

export default function MqttSandbox() {
  const [topic, setTopic] = useState('smart-home/livingroom/temp');
  const [temperature, setTemperature] = useState(24.2);
  const [humidity, setHumidity] = useState(55);
  const [qos, setQos] = useState<0 | 1 | 2>(1);
  const [retain, setRetain] = useState(false);
  
  // Real-time log of broker dispatches
  const [messages, setMessages] = useState<MqttMessage[]>([
    {
      id: 'msg-0',
      topic: 'smart-home/livingroom/temp',
      payload: '{"temp": 23.8, "humidity": 52, "unit": "C"}',
      qos: 1,
      timestamp: '12:00:01',
      sender: 'esp32-sensor-01'
    }
  ]);

  const [activeSubscribers, setActiveSubscribers] = useState<string[]>([
    'smart-home/livingroom/temp',
    'smart-home/+/temp'
  ]);
  const [newSubTopic, setNewSubTopic] = useState('');

  const handlePublish = () => {
    const payload = JSON.stringify({
      temp: parseFloat(temperature.toFixed(1)),
      humidity: Math.round(humidity),
      unit: 'C',
      battery: 92
    });

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newMsg: MqttMessage = {
      id: `msg-${Date.now()}`,
      topic,
      payload,
      qos,
      timestamp: timeStr,
      sender: 'esp32-sensor-01'
    };

    setMessages((prev) => [newMsg, ...prev.slice(0, 7)]);
  };

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubTopic && !activeSubscribers.includes(newSubTopic)) {
      setActiveSubscribers([...activeSubscribers, newSubTopic]);
      setNewSubTopic('');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            Live IoT MQTT Pub/Sub Broker Sandbox
          </h3>
          <p className="text-xs text-slate-400">
            Simulate an ESP32 sensor publishing real-time telemetry to an MQTT broker and watch subscribers receive payloads.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Broker Status: Online (Port 1883)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: IoT Virtual Sensor (Publisher) */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Virtual Sensor (Publisher)</span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block font-mono mb-1">TOPIC NAME</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>SIMULATED TEMPERATURE</span>
              <span className="text-white font-bold">{temperature.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>HUMIDITY</span>
              <span className="text-white font-bold">{humidity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={humidity}
              onChange={(e) => setHumidity(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 block font-mono mb-1">QOS TIER</label>
              <div className="flex gap-1">
                {([0, 1, 2] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQos(q)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                      qos === q
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Q{q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block font-mono mb-1">RETAIN FLAG</label>
              <button
                onClick={() => setRetain(!retain)}
                className={`w-full py-1 rounded text-xs font-mono font-bold border transition-colors ${
                  retain
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {retain ? 'RETAIN: ON' : 'RETAIN: OFF'}
              </button>
            </div>
          </div>

          <button
            onClick={handlePublish}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish MQTT Message</span>
          </button>
        </div>

        {/* Column 2: Active Subscriptions */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Subscribed Dashboards</span>
          </div>

          <p className="text-xs text-slate-400">
            Subscribers receive payloads routed by the broker whenever a matching topic is published.
          </p>

          <form onSubmit={handleAddSubscriber} className="flex gap-2">
            <input
              type="text"
              value={newSubTopic}
              onChange={(e) => setNewSubTopic(e.target.value)}
              placeholder="e.g. smart-home/#"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              Subscribe
            </button>
          </form>

          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Active Topics</span>
            {activeSubscribers.map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                <span className="text-cyan-400">{sub}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">LISTENING</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Live Broker Dispatch Log */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between text-white font-bold text-sm">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Broker Stream Log</span>
            </div>
            <span className="text-[10px] text-slate-500">Live Wire</span>
          </div>

          <div className="h-[260px] overflow-y-auto space-y-2 pr-1">
            {messages.map((m) => (
              <div key={m.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-amber-400 font-bold">PUBLISH [QoS {m.qos}]</span>
                  <span>{m.timestamp}</span>
                </div>
                <div className="text-slate-300 text-[11px] truncate">
                  Topic: <span className="text-emerald-400 font-bold">{m.topic}</span>
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-1.5 rounded border border-slate-800/80 break-all">
                  {m.payload}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

