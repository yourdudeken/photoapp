import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Capture = () => {
    const [stream, setStream] = useState(null);
    const [recorder, setRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [facingMode, setFacingMode] = useState('user');
    const [aspectRatio, setAspectRatio] = useState('full');
    const [captureMode, setCaptureMode] = useState('photo'); // 'photo' | 'video'
    const [flashActive, setFlashActive] = useState(false);

    const videoRef = useRef(null);
    const chunks = useRef([]);
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    // Auto-start camera on mount
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async (mode = facingMode) => {
        try {
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
        } catch (error) {
            console.error('Error accessing camera:', error);
            showError('Could not access the camera. Please check permissions.');
        }
    };

    const flipCamera = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        startCamera(newMode);
    };

    const handleShutter = () => {
        if (captureMode === 'photo') {
            takePicture();
        } else {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        }
    };

    const triggerFlash = () => {
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 200);
    };

    const startRecording = () => {
        if (!stream) return;

        try {
            const mimeType = getSupportedMimeType();
            console.log('Using codec:', mimeType);

            const mediaRecorder = new MediaRecorder(stream, { mimeType });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (chunks.current.length > 0) {
                    const blob = new Blob(chunks.current, { type: mimeType });
                    chunks.current = [];
                    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
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
        } catch (error) {
            console.error('Failed to start recording:', error);
            showError(`Failed to start recording: ${error.message}`);
        }
    };

    const getSupportedMimeType = () => {
        const types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm',
            'video/mp4'
        ];
        return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
    };

    const stopRecording = () => {
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
            setIsRecording(false);
        }
    };

    const takePicture = async () => {
        if (!stream || !videoRef.current) return;

        triggerFlash();

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Handle mirroring if needed (omitted for simplicity, but good for self-facing)
        const ctx = canvas.getContext('2d');
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
            await uploadBlob(blob, 'photo.png');
        }, 'image/png');
    };

    const uploadBlob = async (blob, filename) => {
        setIsUploading(true);
        setUploadProgress(0);

        const form = new FormData();
        form.append('media', blob, filename);

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
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
                    success('Saved to gallery');
                    setTimeout(() => {
                        setIsUploading(false);
                        setUploadProgress(0);
                    }, 1000);
                } else {
                    showError('Upload failed');
                    setIsUploading(false);
                }
            });

            xhr.addEventListener('error', () => {
                showError('Network error');
                setIsUploading(false);
            });

            xhr.open('POST', '/api/upload/file');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(form);
        } catch (error) {
            console.error('Upload error:', error);
            setIsUploading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const getAspectRatioClass = () => {
        return `aspect-${aspectRatio.replace(':', '-')}`;
    };

    return (
        <div className="camera-interface">
            <div className={`viewfinder ${getAspectRatioClass()}`}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={facingMode === 'user' ? 'mirrored' : ''}
                />

                {flashActive && <div className="flash-overlay" />}

                {isRecording && (
                    <div className="recording-indicator">
                        <div className="red-dot" />
                        <span>{formatTime(Date.now())}</span>
                    </div>
                )}

                {/* Top Controls Overlay */}
                <div className="camera-controls-top">
                    <div className="aspect-ratio-pills">
                        {['full', '3:4', '9:16', '1:1', '16:9', '4:3'].map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={aspectRatio === ratio ? 'active' : ''}
                            >
                                {ratio.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bottom Controls Overlay */}
                <div className="camera-controls-bottom">
                    <div className="control-row mode-switcher">
                        <button
                            className={`mode-btn ${captureMode === 'photo' ? 'active' : ''}`}
                            onClick={() => setCaptureMode('photo')}
                        >
                            PHOTO
                        </button>
                        <button
                            className={`mode-btn ${captureMode === 'video' ? 'active' : ''}`}
                            onClick={() => setCaptureMode('video')}
                        >
                            VIDEO
                        </button>
                    </div>

                    <div className="control-row main-actions">
                        <div className="action-left">
                            <button onClick={() => navigate('/gallery')} className="gallery-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            </button>
                        </div>

                        <div className="action-center">
                            <button
                                className={`shutter-btn ${captureMode} ${isRecording ? 'recording' : ''}`}
                                onClick={handleShutter}
                                disabled={isUploading || !stream}
                            >
                                <div className="shutter-inner" />
                            </button>
                        </div>

                        <div className="action-right">
                            <button onClick={flipCamera} className="flip-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 2.025.753 3.872 2 5.285l3-3"></path><path d="M4 14c0 4.418 3.582 8 8 8s8-3.582 8-8c0-2.025-.753-3.872-2-5.285l-3 3"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {isUploading && (
                    <div className="upload-status-pill">
                        Uploading... {uploadProgress}%
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper for fake recording timer (would need real state implementation for actual timer)
const formatTime = () => "REC";

export default Capture;
