const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const db = req.app.get('db');
  const userId = req.query.userId; // or pick from auth
  const items = await db('media').where({ user_id: userId }).orderBy('created_at','desc').select();
  // For s3 provide signed URLs
  const results = items.map(item => {
    if (item.storage_type === 's3') {
      // create presigned URL using AWS SDK
      const s3 = require('aws-sdk/clients/s3');
      const client = new (require('aws-sdk')).S3();
      const url = client.getSignedUrl('getObject', { Bucket: process.env.S3_BUCKET, Key: item.s3_key, Expires: 60*60 });
      return {...item, url};
    } else {
      return { ...item, url: `/media/${item.filename}` };
    }
  });
  res.json(results);
});

module.exports = router;
