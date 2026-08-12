import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    FaFire, FaComments, FaUsers, FaSearch, FaPlus,
    FaArrowUp, FaClock, FaEye, FaReply, FaStar,
    FaUserCircle, FaTimes, FaSpinner, FaExclamationCircle,
    FaGavel, FaChartLine, FaBullhorn
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SEO from '../SEO/SEO';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Toast from '../Toast/Toast';
import './CommunityForums.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Category config for icons and colors (matches backend choices)
const CATEGORY_CONFIG = {
    general: { icon: <FaComments />, color: '#1e90ff', label: 'General Discussion' },
    buying: { icon: <FaStar />, color: '#10b981', label: 'Buying & Selling' },
    location: { icon: <FaChartLine />, color: '#0d5bb5', label: 'Location Reviews' },
    legal: { icon: <FaGavel />, color: '#ef4444', label: 'Legal Advice' },
    development: { icon: <FaBullhorn />, color: '#f59e0b', label: 'Development Updates' },
    investment: { icon: <FaChartLine />, color: '#8b5cf6', label: 'Investment Tips' },
};

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function CommunityForums() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);

    const [threads, setThreads] = useState([]);
    const [stats, setStats] = useState({ total_threads: 0, total_replies: 0, total_members: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Toast notification
    const [toast, setToast] = useState(null); // { message, type }

    const searchRef = useRef(null);
    const searchDebounce = useRef(null);
    const navigate = useNavigate();

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    // --- Fetch threads ---
    const fetchThreads = useCallback(async (tab = 'all') => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_URL}/api/forums/threads/`;
            if (tab === 'hot') url += '?ordering=-replies_count';
            if (tab === 'recent') url += '?ordering=-created_at';

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch threads');
            const data = await res.json();
            setThreads(Array.isArray(data) ? data : data.results || []);
        } catch {
            setError('Unable to load threads. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Fetch stats ---
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/forums/stats/`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetchThreads(activeTab);
        fetchStats();
    }, [fetchThreads, fetchStats, activeTab]);

    // --- Search with debounce ---
    useEffect(() => {
        if (searchDebounce.current) clearTimeout(searchDebounce.current);

        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setSearchLoading(true);
        setShowSearchResults(true);

        searchDebounce.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${API_URL}/api/forums/threads/search/?q=${encodeURIComponent(searchQuery.trim())}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch { /* silent */ } finally {
                setSearchLoading(false);
            }
        }, 350);

        return () => clearTimeout(searchDebounce.current);
    }, [searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchResultClick = (threadId) => {
        navigate(`/forums/thread/${threadId}`);
        setShowSearchResults(false);
        setSearchQuery('');
    };

    const handleViewDiscussion = (threadId) => {
        navigate(`/forums/thread/${threadId}`);
    };

    const handleThreadCreated = () => {
        setShowNewThreadModal(false);
        fetchThreads(activeTab);
        fetchStats();
        showToast('Thread created successfully!');
    };

    // --- Build category counts from loaded threads ---
    const categoryCounts = threads.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
    }, {});

    const statCards = [
        { icon: <FaComments />, label: 'Total Threads', value: stats.total_threads, color: '#1e90ff' },
        { icon: <FaReply />, label: 'Total Replies', value: stats.total_replies, color: '#0d5bb5' },
        { icon: <FaUsers />, label: 'Active Members', value: stats.total_members, color: '#4169e1' },
        { icon: <FaFire />, label: 'Hot Threads', value: threads.filter(t => t.is_hot).length, color: '#ff6347' },
    ];

    const filteredThreads = threads.filter(t => {
        if (activeTab === 'hot') return t.is_hot;
        return true;
    });

    return (
        <>
            <SEO
                title="Community Forums | IJ Estate & Builders"
                description="Join the IJ Estate & Builders community forum. Discuss property investments, get expert advice, share market insights."
                keywords="real estate forum Pakistan, property investment discussion, Lahore real estate community"
                canonicalUrl="/forums"
            />
            <div className="community-forums">
                <Navbar variant="scrolled" />

                {/* Hero */}
                <div className="cf-hero">
                    <div className="cf-hero-bg">
                        <div className="cf-hero-circle cf-hero-circle-1"></div>
                        <div className="cf-hero-circle cf-hero-circle-2"></div>
                        <div className="cf-hero-circle cf-hero-circle-3"></div>
                    </div>
                    <div className="cf-hero-content">
                        <h1 className="cf-hero-title">Community Forums</h1>
                        <p className="cf-hero-subtitle">
                            Connect with fellow investors, share insights, and get expert advice
                        </p>
                        <div className="cf-hero-search" ref={searchRef}>
                            <FaSearch className="cf-hero-search-icon" />
                            <input
                                type="text"
                                placeholder="Search discussions, topics, or authors..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery && setShowSearchResults(true)}
                                className="cf-hero-search-input"
                            />

                            {showSearchResults && (
                                <div className="cf-search-results">
                                    {searchLoading ? (
                                        <div className="cf-search-no-results">
                                            <FaSpinner className="cf-spin" />
                                            <p>Searching...</p>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(thread => (
                                            <div
                                                key={thread.id}
                                                className="cf-search-result-item"
                                                onClick={() => handleSearchResultClick(thread.id)}
                                            >
                                                <div className="cf-search-result-icon"><FaComments /></div>
                                                <div className="cf-search-result-content">
                                                    <div className="cf-search-result-title">{thread.title}</div>
                                                    <div className="cf-search-result-meta">
                                                        <span>{thread.author}</span>
                                                        <span>•</span>
                                                        <span>{thread.replies_count} replies</span>
                                                        <span>•</span>
                                                        <span>{thread.category_display}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="cf-search-no-results">
                                            <FaSearch />
                                            <p>No results for "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="cf-container">
                    {/* Stats */}
                    <div className="cf-stats">
                        {statCards.map((stat, i) => (
                            <div key={i} className="cf-stat-card" style={{ '--accent-color': stat.color }}>
                                <div className="cf-stat-icon">{stat.icon}</div>
                                <div className="cf-stat-info">
                                    <div className="cf-stat-value">{stat.value}</div>
                                    <div className="cf-stat-label">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Categories */}
                    <div className="cf-section">
                        <div className="cf-section-header">
                            <h2 className="cf-section-title">Browse Categories</h2>
                            <button className="cf-btn cf-btn-primary" onClick={() => setShowNewThreadModal(true)}>
                                <FaPlus /> New Thread
                            </button>
                        </div>
                        <div className="cf-categories">
                            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                                <div
                                    key={key}
                                    className="cf-category-card"
                                    style={{ '--category-color': cfg.color }}
                                    onClick={() => navigate(`/forums?category=${key}`)}
                                >
                                    <div className="cf-category-icon">{cfg.icon}</div>
                                    <div className="cf-category-content">
                                        <h3 className="cf-category-name">{cfg.label}</h3>
                                        <div className="cf-category-stats">
                                            <span><FaComments /> {categoryCounts[key] || 0} threads</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Threads */}
                    <div className="cf-section">
                        <div className="cf-section-header">
                            <h2 className="cf-section-title">All Discussions</h2>
                            <div className="cf-tabs">
                                {['all', 'hot', 'recent'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`cf-tab ${activeTab === tab ? 'cf-tab-active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab === 'hot' && <FaFire />}
                                        {tab === 'recent' && <FaClock />}
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="cf-loading">
                                <FaSpinner className="cf-spin" />
                                <p>Loading discussions...</p>
                            </div>
                        ) : error ? (
                            <div className="cf-error">
                                <FaExclamationCircle />
                                <p>{error}</p>
                                <button className="cf-btn cf-btn-primary" onClick={() => fetchThreads(activeTab)}>
                                    Try Again
                                </button>
                            </div>
                        ) : filteredThreads.length === 0 ? (
                            <div className="cf-empty">
                                <FaComments />
                                <p>No discussions yet. Be the first to start one!</p>
                                <button className="cf-btn cf-btn-primary" onClick={() => setShowNewThreadModal(true)}>
                                    <FaPlus /> Start a Discussion
                                </button>
                            </div>
                        ) : (
                            <div className="cf-threads">
                                {filteredThreads.map(thread => {
                                    const catCfg = CATEGORY_CONFIG[thread.category] || CATEGORY_CONFIG.general;
                                    return (
                                        <div key={thread.id} className="cf-thread-card">
                                            {thread.is_pinned && (
                                                <div className="cf-thread-badge cf-thread-badge-pinned">Pinned</div>
                                            )}
                                            {thread.is_hot && !thread.is_pinned && (
                                                <div className="cf-thread-badge cf-thread-badge-hot">Hot</div>
                                            )}

                                            <div className="cf-thread-header">
                                                <FaUserCircle className="cf-thread-avatar" />
                                                <div className="cf-thread-meta">
                                                    <div className="cf-thread-author">{thread.author}</div>
                                                    <div className="cf-thread-time">
                                                        <FaClock /> {timeAgo(thread.created_at)}
                                                    </div>
                                                </div>
                                                <span
                                                    className="cf-thread-category-badge"
                                                    style={{ background: catCfg.color + '22', color: catCfg.color }}
                                                >
                                                    {thread.category_display}
                                                </span>
                                            </div>

                                            <h3 className="cf-thread-title">{thread.title}</h3>
                                            <p className="cf-thread-excerpt">
                                                {thread.content.length > 160
                                                    ? thread.content.substring(0, 160) + '...'
                                                    : thread.content}
                                            </p>

                                            <div className="cf-thread-stats">
                                                <span className="cf-thread-stat">
                                                    <FaReply /> {thread.replies_count} replies
                                                </span>
                                                <span className="cf-thread-stat">
                                                    <FaEye /> {thread.views_count} views
                                                </span>
                                                <span className="cf-thread-stat">
                                                    <FaClock /> {timeAgo(thread.updated_at)}
                                                </span>
                                            </div>

                                            <button
                                                className="cf-thread-btn"
                                                onClick={() => handleViewDiscussion(thread.id)}
                                            >
                                                View Discussion <FaArrowUp className="cf-thread-arrow" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {showNewThreadModal && (
                    <NewThreadModal
                        onClose={() => setShowNewThreadModal(false)}
                        onCreated={handleThreadCreated}
                        showToast={showToast}
                    />
                )}

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                <Footer />
            </div>
        </>
    );
}

// ── Custom Category Dropdown ──────────────────────────────────────────────────

function CategoryDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = CATEGORY_CONFIG[value] || CATEGORY_CONFIG.general;

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="cf-custom-select" ref={ref}>
            {/* Trigger */}
            <button
                type="button"
                className={`cf-custom-select__trigger ${open ? 'cf-custom-select__trigger--open' : ''}`}
                onClick={() => setOpen(o => !o)}
            >
                <span className="cf-custom-select__icon" style={{ color: selected.color }}>
                    {selected.icon}
                </span>
                <span className="cf-custom-select__label">{selected.label}</span>
                <span className={`cf-custom-select__arrow ${open ? 'cf-custom-select__arrow--up' : ''}`}>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M1 1L6 6L11 1" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>

            {/* Panel */}
            {open && (
                <div className="cf-custom-select__panel">
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            type="button"
                            className={`cf-custom-select__option ${value === key ? 'cf-custom-select__option--active' : ''}`}
                            onClick={() => { onChange(key); setOpen(false); }}
                        >
                            <span className="cf-custom-select__opt-icon" style={{ color: cfg.color }}>
                                {cfg.icon}
                            </span>
                            <span className="cf-custom-select__opt-label">{cfg.label}</span>
                            {value === key && (
                                <span className="cf-custom-select__opt-check">
                                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                                        <path d="M1 5L5 9L13 1" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── New Thread Modal ──────────────────────────────────────────────────────────

function NewThreadModal({ onClose, onCreated, showToast }) {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        category: 'general',
        content: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');

        try {
            const res = await fetch(`${API_URL}/api/forums/threads/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(Object.values(errData).flat().join(' ') || 'Failed to create thread.');
            }

            onCreated(); // toast shown by parent
        } catch (err) {
            setSubmitError(err.message);
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="cf-modal-backdrop" onClick={onClose}>
            <div className="cf-modal-panel" onClick={e => e.stopPropagation()}>
                <button className="cf-modal-close" onClick={onClose}><FaTimes /></button>

                <div className="cf-modal-header">
                    <div className="cf-modal-icon"><FaPlus /></div>
                    <div>
                        <h2 className="cf-modal-title">Create New Thread</h2>
                        <p className="cf-modal-subtitle">Start a new discussion in the community</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="cf-modal-form">
                    <div className="cf-form-group">
                        <label className="cf-form-label">Your Name</label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            className="cf-form-input"
                            required
                        />
                    </div>

                    <div className="cf-form-group">
                        <label className="cf-form-label">Thread Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter a descriptive title"
                            className="cf-form-input"
                            required
                        />
                    </div>

                    <div className="cf-form-group">
                        <label className="cf-form-label">Category</label>
                        <CategoryDropdown
                            value={formData.category}
                            onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                        />
                    </div>

                    <div className="cf-form-group">
                        <label className="cf-form-label">Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Write your discussion content here..."
                            className="cf-form-textarea"
                            rows="7"
                            required
                        />
                    </div>

                    {submitError && (
                        <div className="cf-form-error">
                            <FaExclamationCircle /> {submitError}
                        </div>
                    )}

                    <div className="cf-modal-actions">
                        <button type="button" className="cf-btn-secondary" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="cf-btn-primary" disabled={submitting}>
                            {submitting ? <><FaSpinner className="cf-spin" /> Posting...</> : <><FaPlus /> Create Thread</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CommunityForums;
