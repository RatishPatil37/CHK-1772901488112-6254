import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';

const VAPI_PUBLIC_KEY = 'f71004a5-4cfe-49f6-a1e1-de500c7b9f75';
const ASSISTANT_ID = '332d2014-a377-4efd-9787-3daaca164acf';

// Call states
const STATE = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  ACTIVE: 'active',
  SPEAKING: 'speaking',   // assistant is speaking
  LISTENING: 'listening',  // user's turn
  ENDING: 'ending',
};

export default function VapiButton({ mode = 'inline' }) {
  // mode: 'inline' = full panel, 'float' = small floating button
  const [callState, setCallState] = useState(STATE.IDLE);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const vapiRef = useRef(null);
  const bottomRef = useRef(null);

  // Initialise Vapi once
  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on('call-start', () => { setCallState(STATE.ACTIVE); setError(null); });
    vapi.on('call-end', () => { setCallState(STATE.IDLE); });
    vapi.on('speech-start', () => setCallState(STATE.SPEAKING));
    vapi.on('speech-end', () => setCallState(STATE.LISTENING));
    vapi.on('error', (e) => {
      console.error('Vapi error:', e);
      setError('Something went wrong. Please try again.');
      setCallState(STATE.IDLE);
    });

    vapi.on('message', (msg) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        setTranscript(prev => [...prev, { role: msg.role, text: msg.transcript }]);
      }
    });

    return () => {
      vapi.stop();
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const startCall = async () => {
    setCallState(STATE.CONNECTING);
    setTranscript([]);
    setError(null);
    try {
      // Explicitly request microphone access to prevent "not hearing" bugs
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        console.warn('Microphone permission warning (may already be granted):', micErr);
      }

      await vapiRef.current.start(ASSISTANT_ID);

      // Ensure microphone isn't currently muted
      vapiRef.current.setMuted(false);
      setIsMuted(false);
    } catch (e) {
      console.error(e);
      setError('Could not start call. Check mic permissions.');
      setCallState(STATE.IDLE);
    }
  };

  const endCall = () => {
    setCallState(STATE.ENDING);
    vapiRef.current.stop();
  };

  const toggleMute = () => {
    const muted = !isMuted;
    setIsMuted(muted);
    vapiRef.current.setMuted(muted);
  };

  const isActive = [STATE.ACTIVE, STATE.SPEAKING, STATE.LISTENING].includes(callState);

  // ── FLOATING button mode ──────────────────────────────────────────────────
  if (mode === 'float') {
    return (
      <div className="vapi-float-wrapper">
        <button
          className={`vapi-float-btn ${isActive ? 'vapi-float-active' : ''} ${callState === STATE.CONNECTING ? 'vapi-float-connecting' : ''}`}
          onClick={isActive ? endCall : startCall}
          disabled={callState === STATE.CONNECTING || callState === STATE.ENDING}
          title={isActive ? 'End voice call' : 'Talk to AI Assistant'}
        >
          {callState === STATE.CONNECTING ? '⏳' : isActive ? '📵' : '🎙️'}
        </button>
        {isActive && (
          <div className="vapi-float-status">
            {callState === STATE.SPEAKING ? '🔊 Speaking…' : '👂 Listening…'}
          </div>
        )}
      </div>
    );
  }

  // ── INLINE panel mode ─────────────────────────────────────────────────────
  return (
    <div className="vapi-panel">
      {/* Header */}
      <div className="vapi-panel-header">
        <div className="vapi-header-left">
          <div className={`vapi-avatar ${isActive ? 'vapi-avatar-active' : ''}`}>
            🤖
          </div>
          <div>
            <h3 className="vapi-title">Lokseva Voice Assistant</h3>
            <p className="vapi-subtitle">Ask about any government scheme in your language</p>
          </div>
        </div>
        <div className={`vapi-status-badge vapi-status-${callState}`}>
          {callState === STATE.IDLE && '● Idle'}
          {callState === STATE.CONNECTING && '⏳ Connecting…'}
          {callState === STATE.ACTIVE && '● Connected'}
          {callState === STATE.SPEAKING && '🔊 Speaking…'}
          {callState === STATE.LISTENING && '👂 Listening…'}
          {callState === STATE.ENDING && '⏳ Ending…'}
        </div>
      </div>

      {/* Transcript area */}
      <div className="vapi-transcript">
        {transcript.length === 0 && !isActive && (
          <div className="vapi-empty">
            <div className="vapi-empty-icon">🎙️</div>
            <p>Press <strong>Start Call</strong> and ask anything like:</p>
            <ul>
              <li>"Which schemes am I eligible for?"</li>
              <li>"Tell me about Ayushman Bharat"</li>
              <li>"How do I apply for PMKVY?"</li>
            </ul>
          </div>
        )}

        {transcript.length === 0 && isActive && (
          <div className="vapi-connecting-msg">
            <div className="vapi-pulse-ring" />
            <p>{callState === STATE.CONNECTING ? 'Connecting to assistant…' : 'Listening… go ahead and speak!'}</p>
          </div>
        )}

        {transcript.map((msg, i) => (
          <div key={i} className={`vapi-msg vapi-msg-${msg.role}`}>
            <span className="vapi-msg-label">
              {msg.role === 'assistant' ? '🤖 Assistant' : '🧑 You'}
            </span>
            <p className="vapi-msg-text">{msg.text}</p>
          </div>
        ))}

        {/* Live indicator while active */}
        {isActive && callState === STATE.SPEAKING && (
          <div className="vapi-msg vapi-msg-assistant vapi-typing">
            <span className="vapi-msg-label">🤖 Assistant</span>
            <div className="vapi-dots"><span /><span /><span /></div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && <div className="vapi-error">⚠️ {error}</div>}

      {/* Controls */}
      <div className="vapi-controls">
        {!isActive ? (
          <button
            className="vapi-btn vapi-btn-start"
            onClick={startCall}
            disabled={callState === STATE.CONNECTING}
          >
            {callState === STATE.CONNECTING ? '⏳ Connecting…' : '🎙️ Start Voice Call'}
          </button>
        ) : (
          <>
            <button
              className={`vapi-btn vapi-btn-mute ${isMuted ? 'vapi-btn-muted' : ''}`}
              onClick={toggleMute}
            >
              {isMuted ? '🔇 Unmute' : '🎤 Mute'}
            </button>
            <button
              className="vapi-btn vapi-btn-end"
              onClick={endCall}
              disabled={callState === STATE.ENDING}
            >
              📵 End Call
            </button>
          </>
        )}
      </div>
    </div>
  );
}