import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ImageList = () => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/images');
                setImages(response.data);
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchImages();
    }, []);

    return (
        <div>
            {images.map(image => (
                <div key={image._id}>
                    <img src={`http://localhost:5000/${image.path}`} alt={image.originalname} width="200" />
                </div>
            ))}
        </div>
    );
};

export default ImageList;