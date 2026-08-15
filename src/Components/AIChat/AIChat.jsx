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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
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
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      text: inputMessage,
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
        body: JSON.stringify({ message: inputMessage }),
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
        text: 'I apologize, but I encountered an error. Please make sure the AI service is properly configured with a valid API key, or try again later.',
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
      <div className="ai-chat-overlay" onClick={onClose} />
      <div className={`ai-chat-sidebar ${isOpen ? 'open' : ''}`}>
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
          <button className="ai-close-btn" onClick={onClose}>
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
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              rows="1"
              disabled={isLoading}
              autoComplete="off"
              spellCheck="true"
            />
            <button
              className="ai-send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              title="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="ai-chat-footer-text">
            Aira AI • Your Personal Property Consultant ⚡
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;
