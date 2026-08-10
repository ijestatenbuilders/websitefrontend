import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserCircle, FaCheckCircle, FaClock, FaEye, FaReply, FaThumbsUp, FaShare } from 'react-icons/fa';
import SEO from '../SEO/SEO';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './ThreadDetail.css';

function ThreadDetail() {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const [replyText, setReplyText] = useState('');

    // Mock thread data (in real app, fetch from API based on threadId)
    const thread = {
        id: threadId,
        title: 'Best areas for investment in Karachi 2024?',
        author: 'Ahmed Khan',
        verified: true,
        createdAt: '2 hours ago',
        views: 1245,
        replies: 34,
        content: `I'm looking to invest in property in Karachi and would love to hear your thoughts on the best areas for 2024. 
        
I'm particularly interested in areas with good ROI potential and long-term growth prospects. My budget is around 50-80 lakh PKR.

Some areas I'm considering:
• DHA Phase 7 & 8
• Bahria Town Karachi
• Gulistan-e-Jauhar
• Clifton

What are your experiences with these areas? Any other suggestions?`,
        tags: ['Investment', 'Karachi', 'DHA'],
        isPinned: true,
        isHot: true,
        categoryId: 1
    };

    const replies = [
        {
            id: 1,
            author: 'Sara Ali',
            verified: false,
            createdAt: '1 hour ago',
            content: 'DHA Phase 8 is a great choice! The infrastructure is excellent and property values have been steadily increasing. I invested there last year and already seeing good returns.',
            likes: 12
        },
        {
            id: 2,
            author: 'Muhammad Usman',
            verified: true,
            createdAt: '45 minutes ago',
            content: 'From my experience, Bahria Town Karachi offers better ROI compared to DHA. The prices are more reasonable and the development is impressive. However, DHA has better resale value if you\'re looking for quick liquidity.',
            likes: 8
        },
        {
            id: 3,
            author: 'Fatima Ahmed',
            verified: false,
            createdAt: '30 minutes ago',
            content: 'Don\'t overlook Gulistan-e-Jauhar! It\'s an established area with all amenities nearby. Great for rental income if you\'re into buy-to-let investments.',
            likes: 5
        }
    ];

    const handleSubmitReply = (e) => {
        e.preventDefault();
        if (replyText.trim()) {
            console.log('Reply submitted:', replyText);
            alert('Reply posted successfully!');
            setReplyText('');
        }
    };

    return (
        <>
            <SEO
                title={`${thread.title} | IJ Estate Forums`}
                description={thread.content.substring(0, 160)}
                keywords={`real estate discussion, ${thread.tags.join(', ')}, property forum Pakistan`}
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
                            {thread.isPinned && <span className="td-badge td-badge-pinned">Pinned</span>}
                            {thread.isHot && <span className="td-badge td-badge-hot">Hot</span>}
                        </div>
                        <h1 className="td-title">{thread.title}</h1>
                        <div className="td-meta">
                            <div className="td-author-info">
                                <FaUserCircle className="td-avatar" />
                                <span className="td-author">
                                    {thread.author}
                                    {thread.verified && <FaCheckCircle className="td-verified" />}
                                </span>
                            </div>
                            <div className="td-stats">
                                <span><FaClock /> {thread.createdAt}</span>
                                <span><FaEye /> {thread.views} views</span>
                                <span><FaReply /> {thread.replies} replies</span>
                            </div>
                        </div>
                    </div>

                    {/* Thread Content */}
                    <div className="td-content-card">
                        <div className="td-content">
                            {thread.content.split('\n').map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                        <div className="td-tags">
                            {thread.tags.map((tag, idx) => (
                                <span key={idx} className="td-tag">{tag}</span>
                            ))}
                        </div>
                        <div className="td-actions">
                            <button className="td-action-btn">
                                <FaThumbsUp /> Like
                            </button>
                            <button className="td-action-btn">
                                <FaShare /> Share
                            </button>
                        </div>
                    </div>

                    {/* Replies Section */}
                    <div className="td-replies-section">
                        <h2 className="td-replies-title">
                            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                        </h2>

                        <div className="td-replies">
                            {replies.map(reply => (
                                <div key={reply.id} className="td-reply-card">
                                    <div className="td-reply-header">
                                        <div className="td-reply-author-info">
                                            <FaUserCircle className="td-reply-avatar" />
                                            <div>
                                                <span className="td-reply-author">
                                                    {reply.author}
                                                    {reply.verified && <FaCheckCircle className="td-verified" />}
                                                </span>
                                                <span className="td-reply-time">
                                                    <FaClock /> {reply.createdAt}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="td-reply-like-btn">
                                            <FaThumbsUp /> {reply.likes}
                                        </button>
                                    </div>
                                    <div className="td-reply-content">
                                        {reply.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reply Form */}
                    <div className="td-reply-form-card">
                        <h3 className="td-reply-form-title">Post Your Reply</h3>
                        <form onSubmit={handleSubmitReply} className="td-reply-form">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Share your thoughts and experiences..."
                                className="td-reply-textarea"
                                rows="6"
                                required
                            />
                            <div className="td-reply-form-actions">
                                <button type="submit" className="td-submit-btn">
                                    <FaReply /> Post Reply
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}

export default ThreadDetail;
