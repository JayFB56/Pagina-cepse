 'use strict';

const { v2: cloudinary } = require('cloudinary');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;

const isConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isConfigured) {
    cloudinary.config({
        cloud_name: CLOUD_NAME,
        api_key: API_KEY,
        api_secret: API_SECRET,
    });
    console.log('[Cloudinary] configured for', CLOUD_NAME);
} else {
    console.warn('[Cloudinary] not configured - uploads will fall back to local storage');
}

module.exports = { cloudinary, isConfigured };
