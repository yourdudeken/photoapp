import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';

const Capture = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const chunks = useRef([]);
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const startCamera = async (mode = facingMode) => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: { facingMode: mode },
        audio: true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setFacingMode(mode);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      success('Camera started');
    } catch (error) {
      console.error('Error accessing camera:', error);
      showError('Could not access the camera. Please check permissions.');
    }
  };

  const flipCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newMode);
  };

  const startRecording = () => {
    if (stream) {
      try {
        // Try different codecs for better browser compatibility with audio support
        let options;
        let mimeType;

        // Try codecs that support both video and audio
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          options = { mimeType: 'video/webm;codecs=vp9,opus' };
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
          options = { mimeType: 'video/webm;codecs=vp8,opus' };
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus')) {
          options = { mimeType: 'video/webm;codecs=h264,opus' };
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options = { mimeType: 'video/webm' };
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options = { mimeType: 'video/mp4' };
          mimeType = 'video/mp4';
        } else {
          // No mimeType specified, let browser choose
          options = {};
          mimeType = 'video/webm';
        }

        console.log('Using codec:', options.mimeType || 'browser default');

        const mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          if (chunks.current.length > 0) {
            const blob = new Blob(chunks.current, { type: mimeType });
            chunks.current = [];
            const extension = mimeType === 'video/mp4' ? 'mp4' : 'webm';
            await uploadBlob(blob, `video.${extension}`);
          }
        };

        mediaRecorder.onerror = (e) => {
          console.error('MediaRecorder error:', e);
          showError('Recording error occurred');
          setIsRecording(false);
        };

        setRecorder(mediaRecorder);
        mediaRecorder.start();
        setIsRecording(true);
        success('Recording started');
      } catch (error) {
        console.error('Failed to start recording:', error);
        showError(`Failed to start recording: ${error.message}`);
      }
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
      success('Recording stopped');
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
    setIsUploading(true);
    setUploadProgress(0);

    const form = new FormData();
    form.append('media', blob, filename);

    const token = localStorage.getItem('token');
    if (!token) {
      showError('You must be logged in to upload media.');
      setIsUploading(false);
      return;
    }

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          success('Media uploaded successfully!');
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 1000);
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('POST', '/api/upload/file');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(form);
    } catch (error) {
      console.error('Upload error:', error);
      showError('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      success('Camera stopped');
    }
  };

  return (
    <div className="page-container">
      <div className="content-card">
        <h2>Capture Media</h2>
        <p>Take photos or record videos using your device camera</p>

        <div className="capture-container">
          <div className="video-container">
            <video ref={videoRef} autoPlay playsInline muted />
          </div>

          <div className="capture-buttons">
            <button
              onClick={() => startCamera()}
              className={stream ? "success" : ""}
              disabled={isUploading}
            >
              {stream ? '✓ Camera Active' : '📷 Start Camera'}
            </button>

            <button
              onClick={flipCamera}
              disabled={!stream || isUploading}
              className="secondary"
            >
              🔄 Flip Camera
            </button>

            <button
              onClick={takePicture}
              disabled={!stream || isUploading}
            >
              📸 Take Picture
            </button>

            <button
              onClick={startRecording}
              disabled={!stream || isRecording || isUploading}
              className={isRecording ? "danger" : ""}
            >
              {isRecording ? '🔴 Recording...' : '🎥 Start Recording'}
            </button>

            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="danger"
            >
              ⏹️ Stop Recording
            </button>

            <button
              onClick={stopCamera}
              disabled={!stream || isUploading}
              className="secondary"
            >
              ⏸️ Stop Camera
            </button>
          </div>

          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="progress-text">
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button onClick={() => navigate('/gallery')} className="secondary">
              📂 View Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Capture;
