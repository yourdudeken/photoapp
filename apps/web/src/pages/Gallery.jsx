import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Lightbox from '../components/Lightbox';

const Gallery = () => {
    const [media, setMedia] = useState([]);
    const [filteredMedia, setFilteredMedia] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const fetchMedia = useCallback(async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/auth');
            return;
        }

        try {
            const response = await fetch(`/api/gallery?userId=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch media');

            const data = await response.json();
            // Sort by newest first
            const sorted = data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            setMedia(sorted);
        } catch (err) {
            setError(err.message);
            showError('Failed to load gallery');
        } finally {
            setLoading(false);
        }
    }, [navigate, showError]);

    useEffect(() => {
        let filtered = media;

        if (filter === 'photos') {
            filtered = filtered.filter(item => item.content_type.startsWith('image'));
        } else if (filter === 'videos') {
            filtered = filtered.filter(item => item.content_type.startsWith('video'));
        }

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.original_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredMedia(filtered);
    }, [media, filter, searchTerm]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleDelete = async (itemId, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this item?')) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/gallery/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to delete');

            setMedia(prev => prev.filter(item => item.id !== itemId));
            // Close lightbox if open on deleted item
            if (selectedMedia?.id === itemId) setSelectedMedia(null);
            success('Deleted');
        } catch (err) {
            showError('Failed to delete');
        }
    };

    const handleDownload = async (item, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.original_name || `media-${item.id}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            success('Downloading...');
        } catch (err) {
            showError('Download failed');
        }
    };

    return (
        <div className="page-container gallery-page">
            <div className="gallery-layout">
                <div className="gallery-sticky-header">
                    <div className="header-top">
                        <div className="search-bar">
                            <input
                                type="search"
                                placeholder="Search memories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-pills">
                        {['all', 'photos', 'videos'].map(f => (
                            <button
                                key={f}
                                className={`filter-pill ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="loading-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-item" />)}
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                        <h3>No Memories Yet</h3>
                        <p>Capture your first photo or video to get started</p>
                        <button onClick={() => navigate('/capture')} className="primary-btn">
                            Open Camera
                        </button>
                    </div>
                ) : (
                    <div className="masonry-grid">
                        {filteredMedia.map((item) => (
                            <div
                                key={item.id}
                                className="media-card"
                                onClick={() => setSelectedMedia(item)}
                            >
                                <div className="media-wrapper">
                                    {item.content_type.startsWith('video') ? (
                                        <div className="video-thumbnail">
                                            <video src={item.url} preload="metadata" />
                                            <div className="play-icon">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={item.url} alt={item.original_name} loading="lazy" />
                                    )}
                                </div>
                                <div className="media-overlay">
                                    <div className="overlay-actions">
                                        <button
                                            onClick={(e) => handleDownload(item, e)}
                                            title="Download"
                                            className="icon-btn"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            title="Delete"
                                            className="icon-btn danger"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                    <div className="overlay-info">
                                        <span className="date">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedMedia && (
                <Lightbox
                    media={selectedMedia}
                    onClose={() => setSelectedMedia(null)}
                />
            )}
        </div>
    );
};

export default Gallery;
