const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [10000, 'Message content cannot exceed 10000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  tokens: {
    type: Number,
    default: 0
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Chat title cannot exceed 100 characters'],
    default: 'New Chat'
  },
  messages: [messageSchema],
  model: {
    type: String,
    enum: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    default: 'gpt-3.5-turbo'
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, lastActivity: -1 });
chatSchema.index({ userId: 1, isArchived: 1 });

// Update lastActivity before saving
chatSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Method to add message
chatSchema.methods.addMessage = function(role, content, tokens = 0) {
  this.messages.push({
    role,
    content,
    tokens,
    timestamp: new Date()
  });
  this.totalTokens += tokens;
  this.lastActivity = new Date();
  
  // Auto-generate title from first user message if title is default
  if (this.title === 'New Chat' && role === 'user' && this.messages.length === 1) {
    this.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
  }
  
  return this.save();
};

// Method to get recent messages for context
chatSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

module.exports = mongoose.model('Chat', chatSchema);
