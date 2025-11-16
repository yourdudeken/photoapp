import React, { useState, useEffect } from 'react';

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setError('You must be logged in to view the gallery.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/gallery?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }
        const data = await response.json();
        setMedia(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div className="page-container">
      <div className="content-card">
        <h2>Media Gallery</h2>
        <p>View all your captured photos and videos</p>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="spinner"></div>
        ) : media.length === 0 ? (
          <div className="gallery-empty">
            <h3>No media yet</h3>
            <p>Start capturing photos and videos to see them here</p>
          </div>
        ) : (
          <div className="gallery-container">
            <div className="gallery-grid">
              {media.map((item) => (
                <div key={item.id} className="gallery-item">
                  {item.content_type.startsWith('video') ? (
                    <video src={item.url} controls />
                  ) : (
                    <img src={item.url} alt={item.original_name} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
