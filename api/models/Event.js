const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  eventDate: { type: Date, required: true },
  eventTime: { type: String },
  location: String,
  category: {
    type: String,
    enum: ['workshop', 'cultural', 'technical', 'club activity', 'seminar', 'sports', 'other'],
    required: true
  },
  
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, min: 1, max: 5 }
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  image: String
});

module.exports = mongoose.model("Event", eventSchema);
