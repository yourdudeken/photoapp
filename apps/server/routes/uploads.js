const express = require('express');
const multer = require('multer');
const adapter = require('../storage/adapter');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200*1024*1024 } });

function authMiddleware(req,res,next){
  const header = req.headers.authorization?.split(' ')[1];
  if(!header) return res.status(401).json({error:'no auth'});
  try {
    const payload = require('jsonwebtoken').verify(header, process.env.JWT_SECRET || 'change_me');
    req.userId = payload.sub;
    next();
  } catch(e) { res.status(401).json({error:'invalid'}); }
}

router.post('/file', authMiddleware, upload.single('media'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  const filename = Date.now() + '-' + uuidv4() + (req.file.originalname ? ('-' + req.file.originalname) : '');
  const info = await adapter.save(req.file.buffer, filename, req.file.mimetype);
  // store metadata
  const db = req.app.get('db');
  const [rec] = await db('media').insert({
    user_id: req.userId,
    filename: filename,
    original_name: req.file.originalname,
    content_type: req.file.mimetype,
    storage_type: info.storage,
    s3_key: info.key || null
  }).returning(['id','filename']);
  res.json({ id: rec.id, filename: rec.filename });
});

module.exports = router;
