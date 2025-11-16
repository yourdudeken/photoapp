import React, { useState, useEffect } from 'react';

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setError('You must be logged in to view the gallery.');
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
      }
    };

    fetchMedia();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Gallery</h2>
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
  );
};

export default Gallery;
