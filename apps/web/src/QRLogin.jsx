import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useToast } from './ToastContext';

const QRLogin = () => {
  const [qrUrl, setQrUrl] = useState('');
  const canvasRef = useRef();
  const { success, error: showError } = useToast();

  const generateQRToken = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const baseUrl = window.location.origin;
      const tempToken = `${baseUrl}/qr-login?token=${user.id}-${Date.now()}`;
      setQrUrl(tempToken);
      success('QR code generated');
    } else {
      showError('You must be logged in to generate a QR code.');
    }
  };

  useEffect(() => {
    if (qrUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrUrl, { width: 256 }, (error) => {
        if (error) {
          console.error(error);
          showError('Failed to generate QR code');
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
          <button onClick={generateQRToken}>
            📱 Generate QR Code
          </button>

          {qrUrl && (
            <div>
              <p style={{ textAlign: 'center', marginBottom: '16px' }}>
                Scan this QR code with your mobile device to sign in
              </p>
              <div className="qr-code-wrapper">
                <canvas ref={canvasRef} />
              </div>
              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                This QR code is for demonstration purposes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRLogin;
