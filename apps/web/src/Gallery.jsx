import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import Lightbox from './Lightbox';

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

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [media, filter, searchTerm]);

  const fetchMedia = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch(`/api/gallery?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch media');

      const data = await response.json();
      setMedia(data);
    } catch (err) {
      setError(err.message);
      showError('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const filterMedia = () => {
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
  };

  const handleDelete = async (itemId, e) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/gallery/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');

      setMedia(prev => prev.filter(item => item.id !== itemId));
      success('Media deleted successfully');
    } catch (err) {
      showError('Failed to delete media');
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
      success('Download started');
    } catch (err) {
      showError('Failed to download media');
    }
  };

  return (
    <div className="page-container">
      <div className="content-card">
        <div className="gallery-header">
          <div>
            <h2>Media Gallery</h2>
            <p>View and manage your captured photos and videos</p>
          </div>

          <div className="gallery-filters">
            <div className="filter-group">
              <input
                type="search"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: '200px' }}
              />
            </div>

            <div className="view-toggle">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={filter === 'photos' ? 'active' : ''}
                onClick={() => setFilter('photos')}
              >
                📷 Photos
              </button>
              <button
                className={filter === 'videos' ? 'active' : ''}
                onClick={() => setFilter('videos')}
              >
                🎥 Videos
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="spinner"></div>
        ) : filteredMedia.length === 0 ? (
          <div className="gallery-empty">
            <h3>No media found</h3>
            <p>
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'Start capturing photos and videos to see them here'}
            </p>
            {!searchTerm && filter === 'all' && (
              <button onClick={() => navigate('/capture')} style={{ marginTop: '20px' }}>
                Start Capturing
              </button>
            )}
          </div>
        ) : (
          <div className="gallery-container">
            <div className="gallery-grid">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="gallery-item"
                  onClick={() => setSelectedMedia(item)}
                >
                  {item.content_type.startsWith('video') ? (
                    <video src={item.url} />
                  ) : (
                    <img src={item.url} alt={item.original_name} />
                  )}
                  <div className="gallery-overlay">
                    <div className="gallery-actions">
                      <button onClick={(e) => handleDownload(item, e)}>
                        ⬇️ Download
                      </button>
                      <button onClick={(e) => handleDelete(item.id, e)} className="danger">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
