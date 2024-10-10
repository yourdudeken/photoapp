const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    filename: String,
    path: String,
    originalname: String,
    mimetype: String,
    size: Number
}, { timestamps: true });

module.exports = mongoose.model('Image', ImageSchema);