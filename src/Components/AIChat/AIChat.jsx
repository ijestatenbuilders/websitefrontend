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
  '🗣️ Bahria Town mein ghar dikhayein'
];

const GREETING = {
  role: 'assistant',
  text: "Hello! 👋 I'm **Aira**, your AI property consultant at IJ Estates. Ask me about our listings — by area, budget, size or features — or tap the phone to talk to me live.\n\nYou can talk to me in **English, Urdu or Punjabi** — میں آپ کی زبان میں جواب دوں گی. 🌟",
  timestamp: new Date(),
};

// Human-friendly label for a Whisper language code / name.
const LANG_LABEL = (raw = '') => {
  const l = raw.toLowerCase();
  if (l.startsWith('ur') || l.includes('urdu')) return '🇵🇰 Urdu';
  if (l.startsWith('pa') || l.includes('punjab')) return '🇵🇰 Punjabi';
  if (l.startsWith('hi') || l.includes('hindi')) return '🇮🇳 Hindi';
  if (l.startsWith('en') || l.includes('english')) return '🇬🇧 English';
  if (!l || l === 'unknown') return '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
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
  const [detectedLang, setDetectedLang] = useState('');// language Whisper heard, for UI + TTS

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Voice refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const ttsAudioRef = useRef(null);      // currently-playing neural TTS audio
  const callActiveRef = useRef(false);
  const mutedRef = useRef(false);
  const speakerRef = useRef(true);

  useEffect(() => { callActiveRef.current = callActive; }, [callActive]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { speakerRef.current = speakerOn; }, [speakerOn]);

  // Warm up the browser voice list (used only as a fallback if neural TTS fails).
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

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
  // `voice` = true tells the backend to keep replies short and spoken; `replyScript`
  // ('urdu'|'hindi'|'english') controls which script it answers in so our neural
  // TTS voice reads it naturally.
  const askAira = useCallback(async (text, priorMessages, voice = false, replyScript = 'urdu') => {
    const history = priorMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map(m => ({ role: m.role, content: m.text }));

    const res = await fetch(`${API_URL}/api/ai/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history, voice, reply_script: replyScript }),
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

  // ── TEXT TO SPEECH — natural neural voice served by the backend ────────────
  // The browser's built-in speech engine sounds robotic (esp. for Urdu). Instead
  // we fetch human-sounding neural audio (Microsoft Edge voices via edge-tts) from
  // our own /api/ai/tts/ endpoint and play it. Free, no API key, fluent in Urdu.

  // Map the language the user spoke → the script Aira should reply in. Because the
  // server has real Urdu/Hindi voices, we always use each language's native script.
  const scriptForLang = useCallback((hint) => {
    const h = (hint || '').toLowerCase();
    if (h.startsWith('ur') || h.includes('urdu') || h.startsWith('pa') || h.includes('punjab')) return 'urdu';
    if (h.startsWith('hi') || h.includes('hindi')) return 'hindi';
    return 'english';
  }, []);

  const stopSpeaking = useCallback(() => {
    const a = ttsAudioRef.current;
    if (a) { try { a.pause(); a.src = ''; } catch (_) {} ttsAudioRef.current = null; }
    window.speechSynthesis?.cancel();
  }, []);

  // Fetch neural audio for `text` in `lang` and play it. Resolves when playback
  // finishes (or on any failure) so the call loop always continues to listening.

  // Fallback voice: the browser's built-in speech engine. Robotic, but always
  // available — so Aira is NEVER silent even if the neural TTS server is
  // unreachable (e.g. edge-tts blocked on the host, backend down, offline).
  const speakBrowser = useCallback((text, lang = 'english') => new Promise((resolve) => {
    if (!speakerRef.current || !('speechSynthesis' in window)) { resolve(); return; }
    try {
      window.speechSynthesis.cancel();
      const map = { urdu: 'ur-PK', punjabi: 'ur-PK', hindi: 'hi-IN', english: 'en-US' };
      const code = map[(lang || '').toLowerCase()] || 'en-US';
      const u = new SpeechSynthesisUtterance(text);
      u.lang = code;
      const voices = window.speechSynthesis.getVoices() || [];
      const v = voices.find(x => x.lang?.toLowerCase().startsWith(code.slice(0, 2).toLowerCase()))
             || voices.find(x => x.lang?.startsWith('en'));
      if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = 0.97;
      let done = false;
      const fin = () => { if (!done) { done = true; resolve(); } };
      u.onend = fin; u.onerror = fin;
      // Web Speech onend is unreliable — watchdog guarantees the loop continues.
      setTimeout(fin, Math.min(30000, 3000 + (text.split(/\s+/).length * 450)));
      window.speechSynthesis.speak(u);
    } catch (_) { resolve(); }
  }), []);

  const speak = useCallback(async (text, lang = 'english') => {
    if (!speakerRef.current || !text?.trim()) return;
    stopSpeaking();
    let url;
    try {
      const res = await fetch(`${API_URL}/api/ai/tts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      });
      if (!speakerRef.current) return;
      if (!res.ok) {
        console.warn('[Aira] TTS server error', res.status, '— using browser voice');
        return speakBrowser(text, lang);
      }
      const blob = await res.blob();
      if (!blob.size) { console.warn('[Aira] TTS empty — using browser voice'); return speakBrowser(text, lang); }
      url = URL.createObjectURL(blob);
    } catch (e) {
      console.warn('[Aira] TTS request failed', e, '— using browser voice');
      return speakBrowser(text, lang);
    }
    await new Promise((resolve) => {
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      const cleanup = () => {
        audio.onended = null; audio.onerror = null;
        if (url) URL.revokeObjectURL(url);
        if (ttsAudioRef.current === audio) ttsAudioRef.current = null;
      };
      audio.onended = () => { cleanup(); resolve(); };
      audio.onerror = () => { cleanup(); resolve(); };
      // If playback is blocked (autoplay) or fails, fall back to the browser voice.
      audio.play().catch(() => { cleanup(); speakBrowser(text, lang).then(resolve); });
    });
  }, [stopSpeaking, speakBrowser]);

  // ── VOICE CAPTURE with silence auto-stop (call feel) ──────────────────────
  const startListening = useCallback(async () => {
    if (!callActiveRef.current || mutedRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
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
      setCaption('Listening… (tap the circle when you\'re done)');

      // Robust voice-activity detection so we don't cut people off OR stop before
      // they even start talking:
      //  • WARMUP_MS: ignore the first moments (mic opening / greeting echo).
      //  • Require SUSTAINED speech (several consecutive loud frames) before we
      //    treat it as "the user spoke" — a single click/noise spike won't count.
      //  • MIN_MS: never stop the recording before this, so a short startup blip
      //    can't end the turn instantly.
      //  • SILENCE_MS: after real speech, stop once they pause this long.
      let spoke = false;
      let voiceFrames = 0;
      let silenceStart = null;
      const started = Date.now();
      const SPEAK_THRESHOLD = 0.035;
      const NEED_FRAMES = 4;
      const SILENCE_MS = 1100;   // snappier turn-taking once the user pauses
      const MIN_MS = 800;
      const WARMUP_MS = 350;
      const MAX_MS = 15000;

      const tick = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);
        setLevel(Math.min(1, rms * 4));

        const now = Date.now();
        const elapsed = now - started;
        if (elapsed < WARMUP_MS) { rafRef.current = requestAnimationFrame(tick); return; }

        if (rms > SPEAK_THRESHOLD) {
          voiceFrames++;
          if (voiceFrames >= NEED_FRAMES) spoke = true;
          silenceStart = null;
        } else {
          voiceFrames = 0;
          if (spoke && elapsed > MIN_MS) {
            if (silenceStart === null) silenceStart = now;
            else if (now - silenceStart > SILENCE_MS) { stopListening(); return; }
          }
        }
        if (elapsed > MAX_MS) { stopListening(); return; }
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
    console.log('[Aira] captured audio blob:', blob.size, 'bytes');
    // Ignore ultra-short (no speech) clips.
    if (blob.size < 1200) {
      console.log('[Aira] clip too short, re-listening');
      setCaption('Didn\'t hear anything — go ahead, I\'m listening…');
      if (callActiveRef.current && !mutedRef.current) setTimeout(startListening, 300);
      return;
    }

    setCallStatus('thinking');
    setCaption('…');
    try {
      // 1) transcribe
      const fd = new FormData();
      fd.append('audio', blob, 'recording.webm');
      const tRes = await fetch(`${API_URL}/api/ai/transcribe/`, { method: 'POST', body: fd });
      const tData = await tRes.json().catch(() => ({}));
      console.log('[Aira] transcription:', tRes.status, tData);
      const userText = (tData.text || '').trim();
      const lang = (tData.language || '').toLowerCase();
      if (lang) setDetectedLang(lang);

      if (!userText) {
        setCaption('I didn\'t catch that — please speak a little louder and try again.');
        if (callActiveRef.current && !mutedRef.current) setTimeout(startListening, 700);
        return;
      }

      const userMsg = { role: 'user', text: userText, timestamp: new Date() };
      let convo;
      setMessages(prev => { convo = [...prev, userMsg]; return convo; });
      setCaption(`You: ${userText}`);

      // 2) ask Aira. Pick the reply script that will sound most natural aloud on
      //    this device, and tell the backend to answer in that script.
      const script = scriptForLang(lang);
      const { text, properties } = await askAira(userText, convo || [...messages, userMsg], true, script);
      setMessages(prev => [...prev, { role: 'assistant', text, properties, timestamp: new Date() }]);

      // 3) speak in the language the user spoke
      setCallStatus('speaking');
      setCaption(text.replace(/\[\[PROPS.*?\]\]/g, '').trim());
      await speak(text, script);
    } catch (e) {
      setCaption('Connection issue. Retrying…');
    } finally {
      // 4) loop back to listening for a natural call
      if (callActiveRef.current && !mutedRef.current) {
        setCallStatus('listening');
        setTimeout(startListening, 200);
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
    // Aira greets in Urdu (natural neural voice), then starts listening. This also
    // signals to the user right away that they can speak Urdu/Punjabi.
    const hi = 'السلام علیکم! میں آئرا ہوں، آئی جے اسٹیٹس سے۔ آپ مجھ سے اردو، پنجابی یا انگلش، کسی بھی زبان میں بات کر سکتے ہیں۔ بتائیے، میں آپ کی کیا مدد کر سکتی ہوں؟';
    speak(hi, 'urdu').then(() => {
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
    setDetectedLang('');
    stopSpeaking();
    stopListening();
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setMode('chat');
  }, [stopListening, stopSpeaking]);

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
  useEffect(() => () => { stopSpeaking(); cancelAnimationFrame(rafRef.current); }, [stopSpeaking]);

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
            <div
              className={`ai-orb-wrap status-${callStatus} ${callStatus === 'listening' ? 'tappable' : ''}`}
              onClick={() => { if (callStatus === 'listening') stopListening(); }}
              title={callStatus === 'listening' ? 'Tap to send' : ''}
            >
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

            {LANG_LABEL(detectedLang) && (
              <div className="ai-call-lang-pill">
                <span className="ai-lang-dot" /> {LANG_LABEL(detectedLang)}
              </div>
            )}

            <div className="ai-call-caption" dir="auto">{caption}</div>

            <div className="ai-call-controls">
              <button className={`ai-call-btn ${muted ? 'off' : ''}`} onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
                {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <button className="ai-call-btn end" onClick={endCall} title="End call">
                <FaPhoneSlash />
              </button>
              <button className={`ai-call-btn ${!speakerOn ? 'off' : ''}`}
                onClick={() => { setSpeakerOn(s => !s); if (speakerOn) stopSpeaking(); }}
                title={speakerOn ? 'Speaker off' : 'Speaker on'}>
                {speakerOn ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>
            </div>
            <p className="ai-call-hint">Speak in <strong>English, Urdu or Punjabi</strong> — I reply in your language. If I don't stop on my own, <strong>tap the circle</strong> to send. Red button ends the call.</p>
          </div>
        ) : (
          /* ── CHAT MODE ── */
          <>
            <div className="ai-chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`ai-message ${message.role === 'user' ? 'user' : 'ai'}`}>
                  <div className="message-content">
                    <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
                      <p dir="auto" dangerouslySetInnerHTML={{ __html: renderText(message.text) }} />
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
