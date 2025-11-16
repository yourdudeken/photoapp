import React, { useRef, useState } from 'react';

const Capture = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const chunks = useRef([]);

  const startCamera = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Could not access the camera. Please check permissions.');
    }
  };

  const startRecording = () => {
    if (stream) {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorder.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'video/webm' });
        chunks.current = [];
        await uploadBlob(blob, 'video.webm');
      };
      setRecorder(mediaRecorder);
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
    }
  };

  const takePicture = async () => {
    if (stream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        await uploadBlob(blob, 'photo.png');
      }, 'image/png');
    }
  };

  const uploadBlob = async (blob, filename) => {
    setError('');
    setSuccess('');
    const form = new FormData();
    form.append('media', blob, filename);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to upload media.');
      return;
    }
    try {
      const res = await fetch('/api/upload/file', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      await res.json();
      setSuccess('Media uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <div className="content-card">
        <h2>Capture Media</h2>
        <p>Take photos or record videos using your device camera</p>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="capture-container">
          <div className="video-container">
            <video ref={videoRef} autoPlay playsInline muted />
          </div>
          <div className="capture-buttons">
            <button onClick={startCamera} className={stream ? "success" : ""}>
              {stream ? 'Camera Active' : 'Start Camera'}
            </button>
            <button onClick={takePicture} disabled={!stream}>
              Take Picture
            </button>
            <button
              onClick={startRecording}
              disabled={!stream || isRecording}
              className={isRecording ? "danger" : ""}
            >
              {isRecording ? 'Recording...' : 'Start Recording'}
            </button>
            <button onClick={stopRecording} disabled={!isRecording}>
              Stop Recording
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Capture;
