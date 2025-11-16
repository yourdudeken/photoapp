const express = require('express');
const multer = require('multer');
const Image = require('../models/Images');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const image = new Image({
            filename: req.file.filename,
            path: req.file.path,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        await image.save();
        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

router.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

module.exports = router;
