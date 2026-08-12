import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaUserCircle, FaClock, FaEye,
    FaReply, FaShare, FaSpinner, FaExclamationCircle,
    FaComments, FaFire, FaThumbtack
} from 'react-icons/fa';
import SEO from '../SEO/SEO';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Toast from '../Toast/Toast';
import './ThreadDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function ThreadDetail() {
    const { threadId } = useParams();
    const navigate = useNavigate();

    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [replyName, setReplyName] = useState('');
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);
    const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

    const fetchThread = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/forums/threads/${threadId}/`);
            if (!res.ok) throw new Error('Thread not found.');
            const data = await res.json();
            setThread(data);
        } catch (err) {
            setError(err.message || 'Failed to load thread.');
        } finally {
            setLoading(false);
        }
    }, [threadId]);

    useEffect(() => {
        fetchThread();
        window.scrollTo(0, 0);
    }, [fetchThread]);

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyName.trim() || !replyText.trim()) return;

        setSubmitting(true);
        setSubmitError('');
        setSubmitSuccess(false);

        try {
            const res = await fetch(`${API_URL}/api/forums/replies/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    thread: threadId,
                    author_name: replyName.trim(),
                    content: replyText.trim(),
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(Object.values(errData).flat().join(' ') || 'Failed to post reply.');
            }

            setReplyName('');
            setReplyText('');
            setSubmitSuccess(true);
            // Refresh thread to show new reply
            await fetchThread();
            showToast('Reply posted successfully!');
            setTimeout(() => setSubmitSuccess(false), 4000);
        } catch (err) {
            setSubmitError(err.message);
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: thread?.title, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!', 'info');
        }
    };

    // --- Loading ---
    if (loading) {
        return (
            <div className="thread-detail">
                <Navbar variant="scrolled" />
                <div className="td-container td-state-container">
                    <div className="td-state">
                        <FaSpinner className="td-spin" />
                        <p>Loading thread...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // --- Error ---
    if (error || !thread) {
        return (
            <div className="thread-detail">
                <Navbar variant="scrolled" />
                <div className="td-container td-state-container">
                    <div className="td-state td-state-error">
                        <FaExclamationCircle />
                        <p>{error || 'Thread not found.'}</p>
                        <button className="td-back-btn" onClick={() => navigate('/forums')}>
                            <FaArrowLeft /> Back to Forums
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <SEO
                title={`${thread.title} | IJ Estate Forums`}
                description={thread.content.substring(0, 160)}
                keywords={`real estate discussion, ${thread.category_display}, property forum Pakistan`}
                canonicalUrl={`/forums/thread/${threadId}`}
                ogType="article"
            />
            <div className="thread-detail">
                <Navbar variant="scrolled" />

                <div className="td-container">
                    {/* Back Button */}
                    <button className="td-back-btn" onClick={() => navigate('/forums')}>
                        <FaArrowLeft /> Back to Forums
                    </button>

                    {/* Thread Header */}
                    <div className="td-header">
                        <div className="td-badges">
                            {thread.is_pinned && (
                                <span className="td-badge td-badge-pinned">
                                    <FaThumbtack /> Pinned
                                </span>
                            )}
                            {thread.is_hot && (
                                <span className="td-badge td-badge-hot">
                                    <FaFire /> Hot
                                </span>
                            )}
                            <span className="td-badge td-badge-category">
                                {thread.category_display}
                            </span>
                        </div>
                        <h1 className="td-title">{thread.title}</h1>
                        <div className="td-meta">
                            <div className="td-author-info">
                                <FaUserCircle className="td-avatar" />
                                <span className="td-author">{thread.author}</span>
                            </div>
                            <div className="td-stats">
                                <span><FaClock /> {timeAgo(thread.created_at)}</span>
                                <span><FaEye /> {thread.views_count} views</span>
                                <span><FaReply /> {thread.replies_count} replies</span>
                            </div>
                        </div>
                    </div>

                    {/* Thread Content */}
                    <div className="td-content-card">
                        <div className="td-content">
                            {thread.content.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                        <div className="td-actions">
                            <button className="td-action-btn" onClick={handleShare}>
                                <FaShare /> Share
                            </button>
                        </div>
                    </div>

                    {/* Replies Section */}
                    <div className="td-replies-section">
                        <h2 className="td-replies-title">
                            <FaComments />
                            {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
                        </h2>

                        {thread.replies.length === 0 ? (
                            <div className="td-no-replies">
                                <FaComments />
                                <p>No replies yet. Be the first to reply!</p>
                            </div>
                        ) : (
                            <div className="td-replies">
                                {thread.replies.map((reply, idx) => (
                                    <div key={reply.id} className="td-reply-card">
                                        <div className="td-reply-header">
                                            <div className="td-reply-author-info">
                                                <div className="td-reply-avatar-wrap">
                                                    <FaUserCircle className="td-reply-avatar" />
                                                    <span className="td-reply-number">#{idx + 1}</span>
                                                </div>
                                                <div>
                                                    <span className="td-reply-author">{reply.author_name}</span>
                                                    <span className="td-reply-time">
                                                        <FaClock /> {timeAgo(reply.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="td-reply-content">{reply.content}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reply Form */}
                    <div className="td-reply-form-card">
                        <h3 className="td-reply-form-title">
                            <FaReply /> Post Your Reply
                        </h3>
                        <form onSubmit={handleSubmitReply} className="td-reply-form">
                            <div className="td-reply-form-row">
                                <div className="td-form-group">
                                    <label className="td-form-label">Your Name</label>
                                    <input
                                        type="text"
                                        value={replyName}
                                        onChange={e => setReplyName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="td-reply-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="td-form-group">
                                <label className="td-form-label">Your Reply</label>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Share your thoughts and experiences..."
                                    className="td-reply-textarea"
                                    rows="6"
                                    required
                                />
                            </div>

                            {submitError && (
                                <div className="td-form-error">
                                    <FaExclamationCircle /> {submitError}
                                </div>
                            )}

                            {submitSuccess && (
                                <div className="td-form-success">
                                    Reply posted successfully!
                                </div>
                            )}

                            <div className="td-reply-form-actions">
                                <button type="submit" className="td-submit-btn" disabled={submitting}>
                                    {submitting
                                        ? <><FaSpinner className="td-spin" /> Posting...</>
                                        : <><FaReply /> Post Reply</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <Footer />

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </>
    );
}

export default ThreadDetail;
