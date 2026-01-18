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

    useEffect(() => {
        const fetchDashboardData = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                navigate('/auth');
                return;
            }

            try {
                const response = await fetch(`/api/gallery?userId=${user.id}`);
                if (!response.ok) throw new Error('Failed to fetch media');

                const data = await response.json();

                const photos = data.filter(item => item.content_type.startsWith('image'));
                const videos = data.filter(item => item.content_type.startsWith('video'));

                setStats({
                    totalPhotos: photos.length,
                    totalVideos: videos.length,
                    totalMedia: data.length,
                });

                setRecentMedia(data.slice(0, 6));
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="content-card">
                <h1>Dashboard</h1>
                <p>Welcome back! Here's an overview of your media library.</p>

                <div className="stats-grid">
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                        <div className="stat-value">{stats.totalMedia}</div>
                        <div className="stat-label">Total Media</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <div className="stat-value">{stats.totalPhotos}</div>
                        <div className="stat-label">Photos</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <div className="stat-value">{stats.totalVideos}</div>
                        <div className="stat-label">Videos</div>
                    </div>
                </div>

                {recentMedia.length > 0 && (
                    <>
                        <h2>Recent Media</h2>
                        <div className="gallery-grid">
                            {recentMedia.map((item) => (
                                <div key={item.id} className="gallery-item" onClick={() => navigate('/gallery')}>
                                    {item.content_type.startsWith('video') ? (
                                        <video src={item.url} />
                                    ) : (
                                        <img src={item.url} alt={item.original_name} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {recentMedia.length === 0 && (
                    <div className="gallery-empty">
                        <h3>No media yet</h3>
                        <p>Start capturing photos and videos to see them here</p>
                        <button onClick={() => navigate('/capture')} style={{ marginTop: '20px' }}>
                            Start Capturing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
