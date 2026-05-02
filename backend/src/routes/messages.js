const express = require('express');
const https = require('https');
const router = express.Router();
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const PAGE_SIZE = 20;

// GET /messages/:channelId?page=1
router.get('/:channelId', auth, async (req, res) => {
  try {
    const { channelId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const skip = (page - 1) * PAGE_SIZE;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    // Only allow messages for channels user is a member of (optional)
    // if (!channel.members.map(m => m.toString()).includes(req.user.userId)) {
    //   return res.status(403).json({ message: 'Not a member of this channel' });
    // }

    const total = await Message.countDocuments({ channelId });
    const messages = await Message.find({ channelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate('userId', 'name email');

    res.json({
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
      totalMessages: total,
      messages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /messages/upload
router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Construct the file URL (assuming server runs on PORT)
  // For production, this should use the domain name
  const fileUrl = `/uploads/${req.file.filename}`;
  const fileType = req.file.mimetype;

  res.json({
    fileUrl,
    fileType,
    fileName: req.file.originalname
  });
});

// POST /messages/:messageId/translate
router.post('/:messageId/translate', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { targetLanguage } = req.body;

    if (!targetLanguage) {
      return res.status(400).json({ message: 'Target language is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (!message.text) return res.status(400).json({ message: 'Message has no text to translate' });

    // Check if already translated (and ensure it's not a previous error message)
    let existing = null;
    if (message.translations) {
      if (typeof message.translations.get === 'function') {
        existing = message.translations.get(targetLanguage);
      } else {
        existing = message.translations[targetLanguage];
      }
    }

    if (existing && typeof existing === 'string' && !existing.includes("'AUTO' IS AN INVALID SOURCE LANGUAGE")) {
      return res.json({ translatedText: existing });
    }

    // Call Google Translate unofficial API (better auto-detection)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(message.text)}`;
    
    console.log(`[Translation] Requesting: ${targetLanguage} for message ${messageId}`);

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    https.get(url, options, (apiRes) => {
      let data = '';
      
      if (apiRes.statusCode !== 200) {
        console.error(`[Translation] API Error: Status ${apiRes.statusCode}`);
        return res.status(500).json({ message: `Translation API error (${apiRes.statusCode})` });
      }

      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', async () => {
        try {
          const result = JSON.parse(data);
          
          if (!result || !Array.isArray(result) || !result[0]) {
            console.error('[Translation] Unexpected response format:', data);
            throw new Error('Invalid response format');
          }

          // Google API returns: [[["translatedText", "sourceText", ...]], ...]
          const translatedText = result[0]
            .filter(x => x && x[0])
            .map(x => x[0])
            .join('');

          if (!translatedText) {
            throw new Error('Empty translation result');
          }

          // Update message with new translation
          if (!message.translations) message.translations = new Map();
          
          if (typeof message.translations.set === 'function') {
            message.translations.set(targetLanguage, translatedText);
          } else {
            message.translations[targetLanguage] = translatedText;
          }
          
          message.markModified('translations');
          await message.save();

          console.log(`[Translation] Success for ${messageId} (${targetLanguage})`);
          res.json({ translatedText });
        } catch (e) {
          console.error('[Translation] Parse Error:', e.message, 'Data:', data);
          res.status(500).json({ message: 'Error parsing translation' });
        }
      });
    }).on('error', (err) => {
      console.error('[Translation] Connection Error:', err.message);
      res.status(500).json({ message: 'Translation connection failed' });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
