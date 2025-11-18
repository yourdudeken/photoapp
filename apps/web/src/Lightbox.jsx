import React from 'react';

const Lightbox = ({ media, onClose }) => {
    if (!media) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="lightbox" onClick={handleBackdropClick}>
            <button className="lightbox-close" onClick={onClose}>
                ✕
            </button>
            <div className="lightbox-content">
                {media.content_type.startsWith('video') ? (
                    <video src={media.url} controls autoPlay />
                ) : (
                    <img src={media.url} alt={media.original_name} />
                )}
            </div>
        </div>
    );
};

export default Lightbox;
