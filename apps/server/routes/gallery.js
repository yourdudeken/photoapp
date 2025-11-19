const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const db = req.app.get('db');
  const userId = req.query.userId;

  try {
    const items = await db('media')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .select();

    // For s3 provide signed URLs
    const results = items.map(item => {
      if (item.storage_type === 's3') {
        const s3 = require('aws-sdk/clients/s3');
        const client = new (require('aws-sdk')).S3();
        const url = client.getSignedUrl('getObject', {
          Bucket: process.env.S3_BUCKET,
          Key: item.s3_key,
          Expires: 60 * 60
        });
        return { ...item, url };
      } else {
        return { ...item, url: `/media/${item.filename}` };
      }
    });

    res.json(results);
  } catch (error) {
    console.error('Gallery fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

router.delete('/:id', async (req, res) => {
  const db = req.app.get('db');
  const mediaId = req.params.id;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify token and get user
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '55f2b35553327ef6fa0a4518bcda0065795d5595d8d4f91ad4d6d52ef7ae16ab');

    // Get media item to verify ownership
    const mediaItem = await db('media').where({ id: mediaId }).first();

    if (!mediaItem) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Check ownership - decoded.sub contains the user UUID
    if (mediaItem.user_id !== decoded.sub) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete file from storage if local
    if (mediaItem.storage_type !== 's3') {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.env.LOCAL_MEDIA_PATH || './media', mediaItem.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    await db('media').where({ id: mediaId }).del();

    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

module.exports = router;
