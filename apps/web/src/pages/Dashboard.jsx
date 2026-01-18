import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPhotos: 0,
        totalVideos: 0,
        totalMedia: 0,
    });
    const [recentMedia, setRecentMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) {
                navigate('/auth');
                return;
            }

            try {
                const response = await fetch(`/api/gallery?userId=${user.id}`);
                if (!response.ok) throw new Error('Failed to fetch media');

                const data = await response.json();

                // Sort by newest
                data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                const photos = data.filter(item => item.content_type.startsWith('image'));
                const videos = data.filter(item => item.content_type.startsWith('video'));

                setStats({
                    totalPhotos: photos.length,
                    totalVideos: videos.length,
                    totalMedia: data.length,
                });

                setRecentMedia(data.slice(0, 4));
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate, user?.id]);

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <div className="page-container dashboard-page">
            <div className="hero-section">
                <h1>Hello, {user?.username}</h1>
                <p>Ready to capture some memories?</p>

                <button className="cta-button" onClick={() => navigate('/capture')}>
                    <span className="camera-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    </span>
                    Open Camera
                </button>
            </div>

            <div className="stats-overview">
                <div className="mini-stat">
                    <span className="count">{stats.totalPhotos}</span>
                    <span className="label">Photos</span>
                </div>
                <div className="mini-stat">
                    <span className="count">{stats.totalVideos}</span>
                    <span className="label">Videos</span>
                </div>
            </div>

            <div className="recent-section">
                <div className="section-header">
                    <h2>Recent Memories</h2>
                    <button className="text-btn" onClick={() => navigate('/gallery')}>View All</button>
                </div>

                {recentMedia.length > 0 ? (
                    <div className="recent-grid">
                        {recentMedia.map((item) => (
                            <div key={item.id} className="recent-thumb" onClick={() => navigate('/gallery')}>
                                {item.content_type.startsWith('video') ? (
                                    <video src={item.url} />
                                ) : (
                                    <img src={item.url} alt="Recent memory" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-recent">
                        <p>No memories yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
