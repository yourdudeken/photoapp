const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || '55f2b35553327ef6fa0a4518bcda0065795d5595d8d4f91ad4d6d52ef7ae16ab';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_change_me';

// Store pending QR codes in memory (in production, use Redis)
const pendingQRCodes = new Map();

// Cleanup old QR codes every minute
setInterval(() => {
    const now = Date.now();
    for (const [qrId, data] of pendingQRCodes.entries()) {
        if (now - data.createdAt > 5 * 60 * 1000) { // 5 minutes expiry
            pendingQRCodes.delete(qrId);
        }
    }
}, 60 * 1000);

// Generate QR code for login
router.post('/generate', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Verify the user is logged in
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = payload.sub;

        // Get user from database
        const db = req.app.get('db');
        const user = await db('users').where({ id: userId }).first();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate unique QR ID
        const qrId = uuidv4();

        // Store QR code data
        pendingQRCodes.set(qrId, {
            userId: user.id,
            username: user.username,
            createdAt: Date.now(),
            scanned: false
        });

        // Return QR ID (this will be encoded in QR code)
        res.json({ qrId, expiresIn: 300 }); // 5 minutes
    } catch (error) {
        console.error('QR generation error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Scan QR code and authenticate
router.post('/scan/:qrId', async (req, res) => {
    const { qrId } = req.params;

    const qrData = pendingQRCodes.get(qrId);

    if (!qrData) {
        return res.status(404).json({ error: 'QR code not found or expired' });
    }

    if (qrData.scanned) {
        return res.status(400).json({ error: 'QR code already used' });
    }

    // Mark as scanned
    qrData.scanned = true;

    // Get user from database
    const db = req.app.get('db');
    const user = await db('users').where({ id: qrData.userId }).first();

    if (!user) {
        pendingQRCodes.delete(qrId);
        return res.status(404).json({ error: 'User not found' });
    }

    // Generate tokens
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const refresh = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '30d' });

    // Clean up QR code
    pendingQRCodes.delete(qrId);

    res.json({
        token,
        refresh,
        user: {
            id: user.id,
            username: user.username
        }
    });
});

// Check QR code status (for polling)
router.get('/status/:qrId', (req, res) => {
    const { qrId } = req.params;
    const qrData = pendingQRCodes.get(qrId);

    if (!qrData) {
        return res.json({ status: 'expired' });
    }

    if (qrData.scanned) {
        return res.json({ status: 'scanned' });
    }

    res.json({ status: 'pending' });
});

module.exports = router;
