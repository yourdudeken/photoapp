import React, { useRef, useState } from 'react';

const Capture = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
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
      // Optionally, show a success message
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Capture</h2>
      {error && <div className="error-message">{error}</div>}
      <video ref={videoRef} autoPlay playsInline muted />
      <div className="capture-buttons">
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={takePicture} disabled={!stream}>Take Picture</button>
        <button onClick={startRecording} disabled={!stream || isRecording}>
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
      </div>
    </div>
  );
};

export default Capture;
