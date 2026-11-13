'use client';

import React, { useState } from 'react';
import { Cpu, Server, Smartphone, Send, Radio, Trash2 } from 'lucide-react';

interface MqttMessage {
  id: string;
  topic: string;
  payload: string;
  qos: number;
  timestamp: string;
  retain: boolean;
  kind: 'publish' | 'retained';
  recipients: string[];
}

interface RetainedMessage {
  topic: string;
  payload: string;
  qos: number;
}

function topicMatches(filter: string, topic: string): boolean {
  const filterLevels = filter.split('/');
  const topicLevels = topic.split('/');

  for (let index = 0; index < filterLevels.length; index += 1) {
    const level = filterLevels[index];
    if (level === '#') {
      // Multi-level wildcard matches the parent and any number of child levels.
      return index === filterLevels.length - 1;
    }
    if (index >= topicLevels.length) return false;
    if (level !== '+' && level !== topicLevels[index]) return false;
  }

  return filterLevels.length === topicLevels.length;
}

export default function MqttSandbox() {
  const [topic, setTopic] = useState('smart-home/livingroom/temp');
  const [temperature, setTemperature] = useState(24.2);
  const [humidity, setHumidity] = useState(55);
  const [qos, setQos] = useState<0 | 1 | 2>(1);
  const [retain, setRetain] = useState(false);

  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [retained, setRetained] = useState<Record<string, RetainedMessage>>({});
  const [activeSubscribers, setActiveSubscribers] = useState<string[]>([
    'smart-home/livingroom/temp',
    'smart-home/+/temp',
  ]);
  const [newSubTopic, setNewSubTopic] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const appendMessage = (message: MqttMessage) => {
    setMessages((previous) => [message, ...previous].slice(0, 20));
  };

  const handlePublish = () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setFormError('Publish topic cannot be empty.');
      return;
    }

    const payload = JSON.stringify({
      temp: Number(temperature.toFixed(1)),
      humidity: Math.round(humidity),
      unit: 'C',
      battery: 92,
    });

    const recipients = activeSubscribers.filter((filter) => topicMatches(filter, trimmedTopic));
    const timeStr = new Date().toTimeString().split(' ')[0];

    appendMessage({
      id: `msg-${Date.now()}`,
      topic: trimmedTopic,
      payload,
      qos,
      timestamp: timeStr,
      retain,
      kind: 'publish',
      recipients,
    });

    if (retain) {
      setRetained((previous) => ({
        ...previous,
        [trimmedTopic]: { topic: trimmedTopic, payload, qos },
      }));
    }

    setFormError(null);
  };

  const handleAddSubscriber = (event: React.FormEvent) => {
    event.preventDefault();
    const filter = newSubTopic.trim();

    if (!filter) return;
    if (activeSubscribers.includes(filter)) {
      setFormError('That subscription filter already exists.');
      return;
    }
    if (filter.includes('#') && !filter.endsWith('/#') && filter !== '#') {
      setFormError('Multi-level wildcard "#" must be the last level of the filter.');
      return;
    }

    setActiveSubscribers((previous) => [...previous, filter]);
    setNewSubTopic('');
    setFormError(null);

    // A retained message is delivered immediately to a new matching subscriber.
    const matchingRetained = Object.values(retained).filter((entry) => topicMatches(filter, entry.topic));
    for (const entry of matchingRetained) {
      appendMessage({
        id: `retained-${Date.now()}-${entry.topic}`,
        topic: entry.topic,
        payload: entry.payload,
        qos: entry.qos,
        timestamp: new Date().toTimeString().split(' ')[0],
        retain: true,
        kind: 'retained',
        recipients: [filter],
      });
    }
  };

  const handleRemoveSubscriber = (filter: string) => {
    setActiveSubscribers((previous) => previous.filter((entry) => entry !== filter));
  };

  const handleClearLog = () => {
    setMessages([]);
    setRetained({});
  };

  const retainedCount = Object.keys(retained).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" aria-hidden="true" />
            MQTT Pub/Sub Simulator
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Browser simulation
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            This model implements MQTT topic matching (<code>+</code> and <code>#</code>), subscriber delivery, and
            retained messages locally. It does not open a broker connection or publish to port 1883.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
          <Radio className="w-3.5 h-3.5" aria-hidden="true" />
          <span>No network connection</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cpu className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Virtual Sensor (Publisher)</span>
          </div>

          <div>
            <label htmlFor="mqtt-topic" className="text-[11px] text-slate-400 block font-mono mb-1">
              TOPIC NAME
            </label>
            <input
              id="mqtt-topic"
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
              <label htmlFor="mqtt-temperature">SIMULATED TEMPERATURE</label>
              <span className="text-white font-bold">{temperature.toFixed(1)} °C</span>
            </div>
            <input
              id="mqtt-temperature"
              type="range"
              min="10"
              max="45"
              step="0.1"
              value={temperature}
              onChange={(event) => setTemperature(parseFloat(event.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
              <label htmlFor="mqtt-humidity">HUMIDITY</label>
              <span className="text-white font-bold">{humidity}%</span>
            </div>
            <input
              id="mqtt-humidity"
              type="range"
              min="20"
              max="95"
              value={humidity}
              onChange={(event) => setHumidity(parseInt(event.target.value, 10))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono mb-1">QOS TIER</span>
              <div className="flex gap-1" role="group" aria-label="MQTT QoS tier">
                {([0, 1, 2] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setQos(level)}
                    aria-pressed={qos === level}
                    className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                      qos === level
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Q{level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-mono mb-1">RETAIN FLAG</span>
              <button
                type="button"
                onClick={() => setRetain((previous) => !previous)}
                aria-pressed={retain}
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
            type="button"
            onClick={handlePublish}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Publish MQTT Message</span>
          </button>

          {formError && (
            <p role="alert" className="text-[11px] text-rose-300 font-mono">
              {formError}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Smartphone className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>Subscribed Clients</span>
          </div>

          <p className="text-xs text-slate-400">
            A publish is delivered only to filters that match the topic. Adding a client also replays any matching
            retained message.
          </p>

          <form onSubmit={handleAddSubscriber} className="flex gap-2">
            <label htmlFor="mqtt-subscription" className="sr-only">
              Subscription topic filter
            </label>
            <input
              id="mqtt-subscription"
              type="text"
              value={newSubTopic}
              onChange={(event) => setNewSubTopic(event.target.value)}
              placeholder="e.g. smart-home/#"
              className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shrink-0"
            >
              Subscribe
            </button>
          </form>

          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              Active filters ({activeSubscribers.length})
            </span>
            {activeSubscribers.map((filter) => (
              <div
                key={filter}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
              >
                <span className="text-cyan-400 truncate">{filter}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    LISTENING
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubscriber(filter)}
                    className="text-slate-500 hover:text-rose-300"
                    aria-label={`Unsubscribe ${filter}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
            {activeSubscribers.length === 0 && (
              <p className="text-[11px] text-slate-500 font-mono">No subscribers. Publishes are accepted but not delivered.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between text-white font-bold text-sm">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              <span>Dispatch Log</span>
            </div>
            <button
              type="button"
              onClick={handleClearLog}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              Retained topics: {retainedCount}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              Log entries: {messages.length}
            </span>
          </div>

          <div className="h-[260px] overflow-y-auto space-y-2 pr-1" aria-live="polite">
            {messages.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                Publish a message to see which subscription filters match and receive it.
              </p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className={message.kind === 'retained' ? 'text-cyan-400 font-bold' : 'text-amber-400 font-bold'}>
                      {message.kind === 'retained' ? 'RETAINED DELIVERY' : `PUBLISH [QoS ${message.qos}]`}
                    </span>
                    <span>{message.timestamp}</span>
                  </div>
                  <div className="text-slate-300 text-[11px] break-all">
                    Topic: <span className="text-emerald-400 font-bold">{message.topic}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 bg-slate-950 p-1.5 rounded border border-slate-800/80 break-all">
                    {message.payload}
                  </div>
                  <div className="text-[10px] text-slate-500 break-all">
                    Delivered to:{' '}
                    {message.recipients.length > 0 ? (
                      <span className="text-cyan-300">{message.recipients.join(', ')}</span>
                    ) : (
                      <span className="text-rose-300">no matching subscribers</span>
                    )}
                    {message.retain && <span className="ml-1 text-indigo-300">(retain)</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
