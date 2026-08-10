import React, { useState, useRef, useEffect } from 'react';
import { FaFire, FaComments, FaUsers, FaSearch, FaPlus, FaArrowUp, FaClock, FaEye, FaReply, FaStar, FaUserCircle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SEO from '../SEO/SEO';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './CommunityForums.css';

function CommunityForums() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Forum categories
    const categories = [
        {
            id: 1,
            name: 'Property Discussions',
            description: 'Talk about properties, listings, and real estate trends',
            icon: <FaComments />,
            color: '#1e90ff',
            threads: 245,
            posts: 1892
        },
        {
            id: 2,
            name: 'Investment Tips',
            description: 'Share investment strategies and market insights',
            icon: <FaStar />,
            color: '#0d5bb5',
            threads: 189,
            posts: 1543
        },
        {
            id: 3,
            name: 'Legal & Documentation',
            description: 'Questions about paperwork, legalities, and processes',
            icon: <FaCheckCircle />,
            color: '#4169e1',
            threads: 156,
            posts: 987
        },
        {
            id: 4,
            name: 'Community Updates',
            description: 'News and updates from IJ Estates community',
            icon: <FaFire />,
            color: '#00bfff',
            threads: 98,
            posts: 654
        }
    ];

    // Sample threads
    const threads = [
        {
            id: 1,
            categoryId: 1,
            title: 'Best areas for investment in Karachi 2024?',
            author: 'Ahmed Khan',
            avatar: null,
            verified: true,
            replies: 34,
            views: 1245,
            lastActivity: '2 hours ago',
            isPinned: true,
            isHot: true,
            tags: ['Investment', 'Karachi', 'DHA']
        },
        {
            id: 2,
            categoryId: 1,
            title: 'Bahria Town Phase 8 - Worth buying?',
            author: 'Sara Ali',
            avatar: null,
            verified: false,
            replies: 28,
            views: 892,
            lastActivity: '5 hours ago',
            isPinned: false,
            isHot: true,
            tags: ['Bahria Town', 'Phase 8']
        },
        {
            id: 3,
            categoryId: 2,
            title: 'ROI comparison: DHA vs Bahria Town',
            author: 'Muhammad Usman',
            avatar: null,
            verified: true,
            replies: 45,
            views: 2103,
            lastActivity: '1 day ago',
            isPinned: false,
            isHot: true,
            tags: ['ROI', 'DHA', 'Bahria']
        },
        {
            id: 4,
            categoryId: 3,
            title: 'Documentation process for property transfer',
            author: 'Fatima Ahmed',
            avatar: null,
            verified: false,
            replies: 19,
            views: 567,
            lastActivity: '3 hours ago',
            isPinned: false,
            isHot: false,
            tags: ['Documentation', 'Transfer']
        },
        {
            id: 5,
            categoryId: 4,
            title: 'New project launch announcement - Business Bay',
            author: 'IJ Estates Team',
            avatar: null,
            verified: true,
            replies: 67,
            views: 3421,
            lastActivity: '1 hour ago',
            isPinned: true,
            isHot: true,
            tags: ['Announcement', 'Business Bay']
        },
        {
            id: 6,
            categoryId: 1,
            title: 'Tips for first-time property buyers',
            author: 'Ali Raza',
            avatar: null,
            verified: false,
            replies: 52,
            views: 1876,
            lastActivity: '6 hours ago',
            isPinned: false,
            isHot: true,
            tags: ['Beginner', 'Tips']
        }
    ];

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter threads based on search
    const getSearchResults = () => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        return threads.filter(thread =>
            thread.title.toLowerCase().includes(query) ||
            thread.tags.some(tag => tag.toLowerCase().includes(query)) ||
            thread.author.toLowerCase().includes(query)
        ).slice(0, 5); // Show top 5 results
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setShowSearchResults(e.target.value.trim().length > 0);
    };

    const handleSearchResultClick = (threadId) => {
        navigate(`/forums/thread/${threadId}`);
        setShowSearchResults(false);
        setSearchQuery('');
    };

    const handleViewDiscussion = (threadId) => {
        navigate(`/forums/thread/${threadId}`);
    };

    const handleNewThread = () => {
        setShowNewThreadModal(true);
    };

    // Sample stats
    const stats = [
        { icon: <FaComments />, label: 'Total Threads', value: '688', color: '#1e90ff' },
        { icon: <FaReply />, label: 'Total Posts', value: '5,076', color: '#0d5bb5' },
        { icon: <FaUsers />, label: 'Active Members', value: '1,234', color: '#4169e1' },
        { icon: <FaFire />, label: 'Online Now', value: '89', color: '#ff6347' }
    ];

    const filteredThreads = threads.filter(thread => {
        if (activeTab === 'all') return true;
        if (activeTab === 'hot') return thread.isHot;
        if (activeTab === 'recent') return true;
        return true;
    });

    return (
        <>
            <SEO
                title="Community Forums | IJ Estate & Builders | Real Estate Discussions"
                description="Join the IJ Estate & Builders community forum. Discuss property investments, get expert advice, share market insights, and connect with fellow investors in Lahore's real estate market."
                keywords="real estate forum Pakistan, property investment discussion, Lahore real estate community, DHA forum, Bahria Town discussion, property advice Pakistan"
                canonicalUrl="/forums"
            />
            <div className="community-forums">
                <Navbar variant="scrolled" />

                {/* Hero Section */}
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
                                placeholder="Search discussions, topics, or tags..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => searchQuery && setShowSearchResults(true)}
                                className="cf-hero-search-input"
                            />

                            {/* Search Results Dropdown */}
                            {showSearchResults && getSearchResults().length > 0 && (
                                <div className="cf-search-results">
                                    {getSearchResults().map(thread => (
                                        <div
                                            key={thread.id}
                                            className="cf-search-result-item"
                                            onClick={() => handleSearchResultClick(thread.id)}
                                        >
                                            <div className="cf-search-result-icon">
                                                <FaComments />
                                            </div>
                                            <div className="cf-search-result-content">
                                                <div className="cf-search-result-title">{thread.title}</div>
                                                <div className="cf-search-result-meta">
                                                    <span>{thread.author}</span>
                                                    <span>•</span>
                                                    <span>{thread.replies} replies</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showSearchResults && searchQuery && getSearchResults().length === 0 && (
                                <div className="cf-search-results">
                                    <div className="cf-search-no-results">
                                        <FaSearch />
                                        <p>No results found for "{searchQuery}"</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="cf-container">
                    {/* Stats Section */}
                    <div className="cf-stats">
                        {stats.map((stat, index) => (
                            <div key={index} className="cf-stat-card" style={{ '--accent-color': stat.color }}>
                                <div className="cf-stat-icon">{stat.icon}</div>
                                <div className="cf-stat-info">
                                    <div className="cf-stat-value">{stat.value}</div>
                                    <div className="cf-stat-label">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Categories Section */}
                    <div className="cf-section">
                        <div className="cf-section-header">
                            <h2 className="cf-section-title">Browse Categories</h2>
                            <button className="cf-btn cf-btn-primary" onClick={handleNewThread}>
                                <FaPlus /> New Thread
                            </button>
                        </div>

                        <div className="cf-categories">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="cf-category-card"
                                    style={{ '--category-color': category.color }}
                                    onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                                >
                                    <div className="cf-category-icon">{category.icon}</div>
                                    <div className="cf-category-content">
                                        <h3 className="cf-category-name">{category.name}</h3>
                                        <p className="cf-category-desc">{category.description}</p>
                                        <div className="cf-category-stats">
                                            <span><FaComments /> {category.threads} threads</span>
                                            <span><FaReply /> {category.posts} posts</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Threads Section */}
                    <div className="cf-section">
                        <div className="cf-section-header">
                            <h2 className="cf-section-title">
                                {selectedCategory
                                    ? categories.find(c => c.id === selectedCategory)?.name
                                    : 'All Discussions'}
                            </h2>
                            <div className="cf-tabs">
                                <button
                                    className={`cf-tab ${activeTab === 'all' ? 'cf-tab-active' : ''}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`cf-tab ${activeTab === 'hot' ? 'cf-tab-active' : ''}`}
                                    onClick={() => setActiveTab('hot')}
                                >
                                    <FaFire /> Hot
                                </button>
                                <button
                                    className={`cf-tab ${activeTab === 'recent' ? 'cf-tab-active' : ''}`}
                                    onClick={() => setActiveTab('recent')}
                                >
                                    <FaClock /> Recent
                                </button>
                            </div>
                        </div>

                        <div className="cf-threads">
                            {filteredThreads.map((thread) => (
                                <div key={thread.id} className="cf-thread-card">
                                    {thread.isPinned && (
                                        <div className="cf-thread-badge cf-thread-badge-pinned">
                                            Pinned
                                        </div>
                                    )}
                                    {thread.isHot && !thread.isPinned && (
                                        <div className="cf-thread-badge cf-thread-badge-hot">
                                            Hot
                                        </div>
                                    )}

                                    <div className="cf-thread-header">
                                        <FaUserCircle className="cf-thread-avatar" />
                                        <div className="cf-thread-meta">
                                            <div className="cf-thread-author">
                                                {thread.author}
                                                {thread.verified && <FaCheckCircle className="cf-verified" />}
                                            </div>
                                            <div className="cf-thread-time">
                                                <FaClock /> {thread.lastActivity}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="cf-thread-title">{thread.title}</h3>

                                    <div className="cf-thread-tags">
                                        {thread.tags.map((tag, index) => (
                                            <span key={index} className="cf-thread-tag">{tag}</span>
                                        ))}
                                    </div>

                                    <div className="cf-thread-stats">
                                        <span className="cf-thread-stat">
                                            <FaReply /> {thread.replies} replies
                                        </span>
                                        <span className="cf-thread-stat">
                                            <FaEye /> {thread.views} views
                                        </span>
                                    </div>

                                    <button className="cf-thread-btn" onClick={() => handleViewDiscussion(thread.id)}>
                                        View Discussion <FaArrowUp className="cf-thread-arrow" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* New Thread Modal */}
                {showNewThreadModal && <NewThreadModal onClose={() => setShowNewThreadModal(false)} categories={categories} />}

                <Footer />
            </div>
        </>
    );
}

// New Thread Modal Component
function NewThreadModal({ onClose, categories }) {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        content: '',
        tags: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission (you can integrate with backend later)
        console.log('New thread:', formData);
        alert('Thread created successfully!');
        onClose();
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="cf-modal-backdrop" onClick={onClose}>
            <div className="cf-modal-panel" onClick={(e) => e.stopPropagation()}>
                <button className="cf-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="cf-modal-header">
                    <div className="cf-modal-icon">
                        <FaPlus />
                    </div>
                    <div>
                        <h2 className="cf-modal-title">Create New Thread</h2>
                        <p className="cf-modal-subtitle">Start a new discussion in the community</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="cf-modal-form">
                    <div className="cf-form-group">
                        <label className="cf-form-label">Thread Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter a descriptive title for your thread"
                            className="cf-form-input"
                            required
                        />
                    </div>

                    <div className="cf-form-group">
                        <label className="cf-form-label">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="cf-form-select"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="cf-form-group">
                        <label className="cf-form-label">Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Write your discussion content here..."
                            className="cf-form-textarea"
                            rows="8"
                            required
                        />
                    </div>

                    <div className="cf-form-group">
                        <label className="cf-form-label">Tags (comma separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g., Investment, Karachi, DHA"
                            className="cf-form-input"
                        />
                    </div>

                    <div className="cf-modal-actions">
                        <button type="button" className="cf-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="cf-btn-primary">
                            <FaPlus /> Create Thread
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CommunityForums;
