import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding, FaMapMarkerAlt, FaMicrophone, FaPaperPlane, FaTimes,
  FaComments, FaPhoneAlt, FaPhoneSlash, FaMicrophoneSlash, FaVolumeMute, FaVolumeUp
} from 'react-icons/fa';
import './AIChat.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const QUICK_SUGGESTIONS = [
  '🏡 5 Marla house with a pool in Bahria Town',
  '🏢 Commercial plots in Business Bay',
  '💰 Best options under 3.5 Crore',
  '🌤️ What\'s the weather in Lahore today?'
];

const GREETING = {
  role: 'assistant',
  text: "Hello! 👋 I'm Aira, your AI property consultant at IJ Estates. Ask me about our listings — by area, budget, size or features — or tap the phone to talk to me live. I can also help with everyday questions like the weather.",
  timestamp: new Date(),
};

// Lightweight markdown -> HTML (bold, bullets, line breaks). Enough for AI replies.
const renderText = (text = '') => {
  const esc = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\s*[-•]\s+(.*)$/gm, '<span class="li">• $1</span>')
    .replace(/\n/g, '<br/>');
};

const AIChat = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('chat');            // 'chat' | 'call'
  const [messages, setMessages] = useState([GREETING]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Call state
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle|listening|thinking|speaking
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [caption, setCaption] = useState('');
  const [level, setLevel] = useState(0);                // mic volume 0..1 for orb

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Voice refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const callActiveRef = useRef(false);
  const mutedRef = useRef(false);
  const speakerRef = useRef(true);

  useEffect(() => { callActiveRef.current = callActive; }, [callActive]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { speakerRef.current = speakerOn; }, [speakerOn]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };
  useEffect(() => { if (mode === 'chat') scrollToBottom(); }, [messages, isLoading, mode]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimatingOut(false);
      if (mode === 'chat') setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, mode]);

  // ── Core API call (shared by chat + call) ────────────────────────────────
  const askAira = useCallback(async (text, priorMessages) => {
    const history = priorMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map(m => ({ role: m.role, content: m.text }));

    const res = await fetch(`${API_URL}/api/ai/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history }),
    });
    const data = await res.json();
    if (!res.ok && !data.response) throw new Error(data.error || 'Failed');
    return {
      text: data.response || "I couldn't process that. Please try again.",
      properties: data.properties || [],
    };
  }, []);

  // ── CHAT MODE ─────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const ta = e.target;
    setInputMessage(ta.value);
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = (messageText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg = { role: 'user', text: textToSend, timestamp: new Date() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInputMessage('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const { text, properties } = await askAira(textToSend, next);
      setMessages(prev => [...prev, { role: 'assistant', text, properties, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'I hit a momentary connection issue. Please try again.',
        timestamp: new Date(), isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // ── TEXT TO SPEECH (Aira speaks) ──────────────────────────────────────────
  const speak = useCallback((text) => new Promise((resolve) => {
    if (!speakerRef.current || !('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    // Strip markdown / emojis so speech sounds clean.
    const clean = text
      .replace(/\*\*/g, '')
      .replace(/[#*_`>]/g, '')
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '')
      .trim();
    if (!clean) { resolve(); return; }
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.02; u.pitch = 1.05; u.lang = 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /female|zira|samantha|aria|google us english/i.test(v.name))
      || voices.find(v => v.lang?.startsWith('en'));
    if (preferred) u.voice = preferred;
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  }), []);

  // ── VOICE CAPTURE with silence auto-stop (call feel) ──────────────────────
  const startListening = useCallback(async () => {
    if (!callActiveRef.current || mutedRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        cancelAnimationFrame(rafRef.current);
        stream.getTracks().forEach(t => t.stop());
        ctx.close().catch(() => {});
        setLevel(0);
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleVoiceTurn(blob);
      };

      recorder.start();
      setCallStatus('listening');
      setCaption('Listening…');

      // Silence detection: stop ~1.4s after speech ends, hard cap 12s.
      let spoke = false;
      let silenceStart = null;
      const started = Date.now();
      const SPEAK_THRESHOLD = 0.045;
      const SILENCE_MS = 1400;

      const tick = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);
        setLevel(Math.min(1, rms * 4));

        const now = Date.now();
        if (rms > SPEAK_THRESHOLD) { spoke = true; silenceStart = null; }
        else if (spoke) {
          if (silenceStart === null) silenceStart = now;
          else if (now - silenceStart > SILENCE_MS) { stopListening(); return; }
        }
        if (now - started > 12000) { stopListening(); return; }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error('Mic error:', err);
      setCaption('Microphone blocked. Please allow mic access.');
      setCallStatus('idle');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopListening = useCallback(() => {
    const r = mediaRecorderRef.current;
    if (r && r.state === 'recording') r.stop();
  }, []);

  const handleVoiceTurn = useCallback(async (blob) => {
    if (!callActiveRef.current) return;
    // Ignore ultra-short (no speech) clips.
    if (blob.size < 2000) { if (callActiveRef.current && !mutedRef.current) startListening(); return; }

    setCallStatus('thinking');
    setCaption('…');
    try {
      // 1) transcribe
      const fd = new FormData();
      fd.append('audio', blob, 'recording.webm');
      const tRes = await fetch(`${API_URL}/api/ai/transcribe/`, { method: 'POST', body: fd });
      const tData = await tRes.json();
      const userText = (tData.text || '').trim();

      if (!userText) {
        setCaption("I didn't catch that. Please try again.");
        if (callActiveRef.current && !mutedRef.current) setTimeout(startListening, 800);
        return;
      }

      const userMsg = { role: 'user', text: userText, timestamp: new Date() };
      let convo;
      setMessages(prev => { convo = [...prev, userMsg]; return convo; });
      setCaption(`You: ${userText}`);

      // 2) ask Aira
      const { text, properties } = await askAira(userText, convo || [...messages, userMsg]);
      setMessages(prev => [...prev, { role: 'assistant', text, properties, timestamp: new Date() }]);

      // 3) speak
      setCallStatus('speaking');
      setCaption(text.replace(/\[\[PROPS.*?\]\]/g, '').trim());
      await speak(text);
    } catch (e) {
      setCaption('Connection issue. Retrying…');
    } finally {
      // 4) loop back to listening for a natural call
      if (callActiveRef.current && !mutedRef.current) {
        setCallStatus('listening');
        setTimeout(startListening, 400);
      } else if (callActiveRef.current) {
        setCallStatus('idle');
        setCaption('Muted. Unmute to keep talking.');
      }
    }
  }, [askAira, speak, messages, startListening]);

  const startCall = useCallback(() => {
    setMode('call');
    setCallActive(true);
    callActiveRef.current = true;
    setMuted(false);
    setSpeakerOn(true);
    setCaption('Connecting…');
    setCallStatus('speaking');
    // Aira greets, then starts listening.
    const hi = "Hi, you're connected to Aira from IJ Estates. How can I help you today?";
    speak(hi).then(() => {
      if (callActiveRef.current && !mutedRef.current) { setCallStatus('listening'); startListening(); }
    });
    setCaption(hi);
  }, [speak, startListening]);

  const endCall = useCallback(() => {
    setCallActive(false);
    callActiveRef.current = false;
    setCallStatus('idle');
    setCaption('');
    setLevel(0);
    window.speechSynthesis?.cancel();
    stopListening();
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setMode('chat');
  }, [stopListening]);

  const toggleMute = () => {
    setMuted(prev => {
      const nv = !prev;
      mutedRef.current = nv;
      if (nv) { stopListening(); setCallStatus('idle'); setCaption('Muted'); }
      else if (callActiveRef.current) { setCallStatus('listening'); startListening(); }
      return nv;
    });
  };

  // Cleanup on close/unmount
  const handleClose = () => {
    setIsAnimatingOut(true);
    endCall();
    setTimeout(() => { setIsAnimatingOut(false); onClose(); }, 300);
  };
  useEffect(() => () => { window.speechSynthesis?.cancel(); cancelAnimationFrame(rafRef.current); }, []);

  const handlePropertyClick = (propertyId, locationCode) => {
    handleClose();
    navigate(`/properties/${locationCode}/${propertyId}`);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (!isOpen) return null;

  const PropertyCards = ({ properties }) => (
    <div className="ai-property-results">
      <div className="results-header">
        <span className="results-count">
          <FaBuilding className="results-count-icon" /> {properties.length} {properties.length === 1 ? 'Match' : 'Matches'}
        </span>
      </div>
      <div className="property-cards-container">
        {properties.map((property) => (
          <div key={property.id} className="ai-property-card"
            onClick={() => handlePropertyClick(property.id, property.location_code)}>
            <div className="property-card-image">
              {property.image
                ? <img src={property.image} alt={property.name} />
                : <div className="property-card-placeholder">No Image</div>}
              {property.badge && <span className="property-badge">{property.badge}</span>}
            </div>
            <div className="property-card-details">
              <h4>{property.name}</h4>
              <div className="property-card-info">
                <span className="property-price">{property.price}</span>
                <span className="property-meta">{property.marla} • {property.type}</span>
                <span className="property-location"><FaMapMarkerAlt /> {property.block}, {property.location}</span>
              </div>
              {property.features?.length > 0 && (
                <div className="property-features-mini">
                  {property.features.slice(0, 3).map((f, i) => <span key={i} className="feature-tag">{f}</span>)}
                  {property.features.length > 3 && <span className="feature-tag more">+{property.features.length - 3}</span>}
                </div>
              )}
              <button className="view-details-btn"><span>Explore Details</span> →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className={`ai-chat-overlay ${isAnimatingOut ? 'fade-out' : ''}`} onClick={handleClose} />
      <div className={`ai-chat-sidebar ${isOpen ? 'open' : ''} ${isAnimatingOut ? 'closing' : ''}`}>
        <div className="ai-chat-top-glow" />

        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-content">
            <div className="ai-avatar">
              <div className={`ai-avatar-icon ${callActive ? 'live' : ''}`}>Aira</div>
              <div className="ai-status-indicator" />
            </div>
            <div className="ai-header-text">
              <div className="ai-header-title-row">
                <h3>Aira AI</h3>
                <span className="ai-header-badge">{callActive ? 'On Call' : 'Property Consultant'}</span>
              </div>
              <p className="ai-header-subtitle">
                <span className="ai-pulse-dot" /> {callActive ? 'Live voice call' : 'Online • Ready to help'}
              </p>
            </div>
          </div>
          <div className="ai-header-actions">
            {!callActive && (
              <button
                className={`ai-mode-toggle ${mode === 'call' ? 'active' : ''}`}
                onClick={() => (mode === 'chat' ? startCall() : setMode('chat'))}
                title={mode === 'chat' ? 'Start voice call' : 'Back to chat'}
              >
                {mode === 'chat' ? <FaPhoneAlt /> : <FaComments />}
              </button>
            )}
            <button className="ai-close-btn" onClick={handleClose} aria-label="Close">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* ── CALL MODE ── */}
        {mode === 'call' ? (
          <div className="ai-call-screen">
            <div className={`ai-orb-wrap status-${callStatus}`}>
              <div className="ai-orb-ring r1" style={{ transform: `scale(${1 + level * 0.5})` }} />
              <div className="ai-orb-ring r2" style={{ transform: `scale(${1 + level * 0.8})` }} />
              <div className="ai-orb" style={{ transform: `scale(${1 + level * 0.25})` }}>
                <span>Aira</span>
              </div>
            </div>

            <div className="ai-call-status-label">
              {callStatus === 'listening' && '🎙️ Listening…'}
              {callStatus === 'thinking' && '💭 Thinking…'}
              {callStatus === 'speaking' && '🔊 Speaking…'}
              {callStatus === 'idle' && (muted ? 'Muted' : 'Connecting…')}
            </div>

            <div className="ai-call-caption">{caption}</div>

            <div className="ai-call-controls">
              <button className={`ai-call-btn ${muted ? 'off' : ''}`} onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
                {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <button className="ai-call-btn end" onClick={endCall} title="End call">
                <FaPhoneSlash />
              </button>
              <button className={`ai-call-btn ${!speakerOn ? 'off' : ''}`}
                onClick={() => { setSpeakerOn(s => !s); if (speakerOn) window.speechSynthesis?.cancel(); }}
                title={speakerOn ? 'Speaker off' : 'Speaker on'}>
                {speakerOn ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>
            </div>
            <p className="ai-call-hint">Speak naturally — I'll reply when you pause. Tap the red button to end.</p>
          </div>
        ) : (
          /* ── CHAT MODE ── */
          <>
            <div className="ai-chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`ai-message ${message.role === 'user' ? 'user' : 'ai'}`}>
                  <div className="message-content">
                    <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
                      <p dangerouslySetInnerHTML={{ __html: renderText(message.text) }} />
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                    {message.properties?.length > 0 && <PropertyCards properties={message.properties} />}
                  </div>
                </div>
              ))}

              {messages.length === 1 && !isLoading && (
                <div className="ai-quick-suggestions">
                  <div className="ai-quick-title">✨ Try asking</div>
                  <div className="ai-quick-grid">
                    {QUICK_SUGGESTIONS.map((s, i) => (
                      <button key={i} className="ai-quick-chip" onClick={() => handleSendMessage(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="ai-message ai">
                  <div className="message-content">
                    <div className="message-bubble typing">
                      <div className="typing-indicator"><span /><span /><span /></div>
                      <span className="typing-text">Aira is thinking…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat-input-container">
              <div className="ai-chat-input-wrapper">
                <button className="ai-voice-btn" onClick={startCall} disabled={isLoading}
                  title="Start voice call" aria-label="Start voice call">
                  <FaPhoneAlt />
                </button>
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Aira anything…"
                  rows="1"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <button className="ai-send-btn" onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading} title="Send" aria-label="Send">
                  <FaPaperPlane />
                </button>
              </div>
              <div className="ai-chat-footer-text">
                <span>⚡ Powered by IJ Estates AI • Live listings & real-time answers</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AIChat;
