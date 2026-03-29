const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: false }, // Text becomes optional if there's a file
  fileUrl: { type: String },
  fileType: { type: String },
  translations: { type: Map, of: String, default: {} }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Message', MessageSchema);
