import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRLogin = () => {
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef();

  const generateQRToken = async () => {
    setError('');
    // This is a simplified flow. In a real app, you'd get the token
    // from the server and poll for login success.
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const tempToken = `http://localhost:5000/qr-login?token=${user.id}-${Date.now()}`;
      setQrUrl(tempToken);
    } else {
      setError('You must be logged in to generate a QR code.');
    }
  };

  useEffect(() => {
    if (qrUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrUrl, (error) => {
        if (error) console.error(error);
      });
    }
  }, [qrUrl]);

  return (
    <div>
      <h2>QR Login</h2>
      {error && <div className="error-message">{error}</div>}
      <button onClick={generateQRToken}>Generate QR Code</button>
      {qrUrl && (
        <div>
          <p>Scan this QR code with your mobile device.</p>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
};

export default QRLogin;
