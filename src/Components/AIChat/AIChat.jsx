import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIChat.css';

const AIChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: 'Hello! 👋 I\'m Aira, your AI property assistant. I can help you find the perfect property based on your needs. Just tell me what you\'re looking for - budget, size, features like cinema or pool, location preferences, etc.',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setIsAnimatingOut(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Handle closing with animation
  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice input.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/ai/transcribe/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setInputMessage(data.text);
        // Auto-send the transcribed message
        setTimeout(() => {
          handleSendMessage(data.text);
        }, 100);
      } else {
        // Show error message from backend
        const errorMsg = data.error || 'Transcription failed';
        const errorMessage = {
          type: 'ai',
          text: `🎤 ${errorMsg}\n\nPlease try:\n• Speaking more clearly\n• Speaking louder\n• Getting closer to the microphone\n• Saying complete sentences`,
          timestamp: new Date(),
          isError: true,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = {
        type: 'ai',
        text: '🎤 Could not transcribe audio. Please check your internet connection and try again, or type your message instead.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-resize textarea smoothly
  const handleInputChange = (e) => {
    const textarea = e.target;
    setInputMessage(textarea.value);

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set new height based on content (max 120px)
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Reset textarea height after sending
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/ai/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      // Add AI response
      const aiMessage = {
        type: 'ai',
        text: data.response,
        properties: data.properties || [],
        reasoning: data.reasoning,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = {
        type: 'ai',
        text: 'I apologize, but I encountered an error. Please try again later.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePropertyClick = (propertyId, locationCode) => {
    onClose();
    navigate(`/properties/${locationCode}/${propertyId}`);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`ai-chat-overlay ${isAnimatingOut ? 'fade-out' : ''}`}
        onClick={handleClose}
      />
      <div className={`ai-chat-sidebar ${isOpen ? 'open' : ''} ${isAnimatingOut ? 'closing' : ''}`}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-content">
            <div className="ai-avatar">
              <div className="ai-avatar-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ai-status-indicator"></div>
            </div>
            <div className="ai-header-text">
              <h3>Aira - AI Assistant</h3>
              <p>Online • Ready to help</p>
            </div>
          </div>
          <button className="ai-close-btn" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`ai-message ${message.type}`}>
              <div className="message-content">
                <div className="message-bubble">
                  <p>{message.text}</p>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>

                {/* Property Cards */}
                {message.properties && message.properties.length > 0 && (
                  <div className="ai-property-results">
                    <div className="results-header">
                      <span className="results-count">
                        {message.properties.length} {message.properties.length === 1 ? 'Property' : 'Properties'} Found
                      </span>
                    </div>
                    <div className="property-cards-container">
                      {message.properties.map((property) => (
                        <div
                          key={property.id}
                          className="ai-property-card"
                          onClick={() => handlePropertyClick(property.id, property.location_code)}
                        >
                          <div className="property-card-image">
                            {property.image ? (
                              <img src={property.image} alt={property.name} />
                            ) : (
                              <div className="property-card-placeholder">No Image</div>
                            )}
                            {property.badge && (
                              <span className="property-badge">{property.badge}</span>
                            )}
                          </div>
                          <div className="property-card-details">
                            <h4>{property.name}</h4>
                            <div className="property-card-info">
                              <span className="property-price">{property.price}</span>
                              <span className="property-meta">{property.marla} • {property.type}</span>
                              <span className="property-location">
                                📍 {property.block}, {property.location}
                              </span>
                            </div>
                            {property.features && property.features.length > 0 && (
                              <div className="property-features-mini">
                                {property.features.slice(0, 3).map((feature, idx) => (
                                  <span key={idx} className="feature-tag">{feature}</span>
                                ))}
                                {property.features.length > 3 && (
                                  <span className="feature-tag more">+{property.features.length - 3}</span>
                                )}
                              </div>
                            )}
                            <button className="view-details-btn">
                              View Details →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="ai-message ai">
              <div className="message-content">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-chat-input-container">
          <div className="ai-chat-input-wrapper">
            <button
              className={`ai-voice-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              title={isRecording ? "Stop recording" : "Voice input (Urdu/English)"}
            >
              {isRecording ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 19V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "Recording..." : "Ask me anything..."}
              rows="1"
              disabled={isLoading || isRecording}
              autoComplete="off"
              spellCheck="true"
            />
            <button
              className="ai-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              title="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="ai-chat-footer-text">
            Aira AI • Your Personal Property Consultant ⚡ {isRecording && <span className="recording-indicator">● Recording</span>}
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;
