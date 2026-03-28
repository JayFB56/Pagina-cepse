const axios = require('axios');
require('dotenv').config();

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

module.exports = {
    generateVideo: async (script) => {
        try {
            const response = await axios.post('https://api.heygen.com/v2/video/generate', {
                video_inputs: [
                    {
                        character: {
                            type: 'avatar',
                            avatar_id: process.env.HEYGEN_AVATAR_ID || 'josh_lite_20230714',
                            avatar_style: 'normal'
                        },
                        voice: {
                            type: 'text',
                            input_text: script,
                            voice_id: process.env.HEYGEN_VOICE_ID || '1bd001e7e50f421d89198797ada8e39a' // Spanish narrator
                        }
                    }
                ],
                dimension: { width: 1280, height: 720 }
            }, {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.data) {
                return {
                    videoId: response.data.data.video_id,
                    status: 'processing'
                };
            }
            return null;
        } catch (error) {
            console.error('Error with HeyGen API:', error.response ? error.response.data : error.message);
            return null;
        }
    },

    checkVideoStatus: async (videoId) => {
        try {
            const response = await axios.get(`https://api.heygen.com/v2/video/status?video_id=${videoId}`, {
                headers: { 'X-Api-Key': HEYGEN_API_KEY }
            });
            return response.data.data; // { status: 'completed', video_url: '...' } etc.
        } catch (error) {
            console.error('Error checking HeyGen status:', error.message);
            return null;
        }
    }
};
