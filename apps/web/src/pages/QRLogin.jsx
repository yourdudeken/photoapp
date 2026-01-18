import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { useToast } from '../context/ToastContext';

const QRLogin = ({ onLogin }) => {
    const [qrUrl, setQrUrl] = useState('');
    const [qrId, setQrId] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Handle QR code scanning (when user scans QR on mobile)
    useEffect(() => {
        const qrIdParam = searchParams.get('qrId');
        if (qrIdParam) {
            handleQRScan(qrIdParam);
        }
    }, [searchParams]);

    const handleQRScan = async (scannedQrId) => {
        try {
            const response = await fetch(`/api/qr-auth/scan/${scannedQrId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                if (onLogin) onLogin(data.user);
                success('Logged in successfully via QR code!');
                navigate('/');
            } else {
                showError(data.error || 'QR code invalid or expired');
            }
        } catch (error) {
            console.error('QR scan error:', error);
            showError('Failed to authenticate with QR code');
        }
    };

    const generateQRCode = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('You must be logged in to generate a QR code');
            navigate('/auth');
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch('/api/qr-auth/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && data.qrId) {
                const baseUrl = window.location.origin;
                const qrUrl = `${baseUrl}/qr-login?qrId=${data.qrId}`;
                setQrUrl(qrUrl);
                setQrId(data.qrId);
                success('QR code generated! Scan with your mobile device.');
            } else {
                showError(data.error || 'Failed to generate QR code');
            }
        } catch (error) {
            console.error('QR generation error:', error);
            showError('Failed to generate QR code');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (qrUrl && canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, qrUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#000000',
                    light: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#FFFFFF'
                }
            }, (error) => {
                if (error) {
                    console.error(error);
                    showError('Failed to render QR code');
                }
            });
        }
    }, [qrUrl, showError]);

    return (
        <div className="page-container">
            <div className="content-card">
                <h2>QR Code Login</h2>
                <p>Generate a QR code to quickly sign in on another device</p>

                <div className="qr-container">
                    <button
                        onClick={generateQRCode}
                        disabled={isGenerating}
                        className="primary"
                    >
                        {isGenerating ? 'Generating...' : 'Generate QR Code'}
                    </button>

                    {qrUrl && (
                        <div className="qr-display">
                            <div className="qr-info">
                                <p>
                                    <strong>Scan this QR code with your mobile device</strong>
                                </p>
                                <p className="qr-instructions">
                                    1. Open the camera app on your phone<br />
                                    2. Point it at the QR code below<br />
                                    3. Tap the notification to sign in
                                </p>
                            </div>

                            <div className="qr-code-wrapper">
                                <canvas ref={canvasRef} />
                            </div>

                            <div className="qr-footer">
                                <p className="qr-expiry">
                                    Expires in 5 minutes
                                </p>
                                <button
                                    onClick={generateQRCode}
                                    className="secondary"
                                    style={{ marginTop: '16px' }}
                                >
                                    Generate New Code
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRLogin;
