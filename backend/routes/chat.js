const express = require('express');
const OpenAI = require('openai');
const Chat = require('../models/Chat');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all chats for user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, archived = false } = req.query;
    
    const chats = await Chat.find({
      userId: req.user._id,
      isArchived: archived === 'true'
    })
    .select('title lastActivity messageCount totalTokens createdAt')
    .sort({ lastActivity: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Chat.countDocuments({
      userId: req.user._id,
      isArchived: archived === 'true'
    });

    res.json({
      chats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Error fetching chats.',
        status: 500
      }
    });
  }
});

// Create new chat
router.post('/', async (req, res) => {
  try {
    const { title = 'New Chat', model = 'gpt-3.5-turbo' } = req.body;

    const chat = new Chat({
      userId: req.user._id,
      title,
      model
    });

    await chat.save();

    res.status(201).json({
      message: 'Chat created successfully',
      chat: {
        id: chat._id,
        title: chat.title,
        model: chat.model,
        messages: chat.messages,
        createdAt: chat.createdAt,
        lastActivity: chat.lastActivity
      }
    });

  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Error creating chat.',
        status: 500
      }
    });
  }
});

// Get specific chat
router.get('/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        error: {
          message: 'Chat not found.',
          status: 404
        }
      });
    }

    res.json({
      chat: {
        id: chat._id,
        title: chat.title,
        model: chat.model,
        messages: chat.messages,
        totalTokens: chat.totalTokens,
        createdAt: chat.createdAt,
        lastActivity: chat.lastActivity
      }
    });

  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Error fetching chat.',
        status: 500
      }
    });
  }
});

// Send message to chat
router.post('/:chatId/messages', async (req, res) => {
  try {
    const { message, model } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: {
          message: 'Message content is required.',
          status: 400
        }
      });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        error: {
          message: 'Chat not found.',
          status: 404
        }
      });
    }

    // Add user message
    await chat.addMessage('user', message.trim());

    // Prepare messages for OpenAI
    const recentMessages = chat.getRecentMessages(10);
    const openaiMessages = recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: model || chat.model,
        messages: openaiMessages,
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      });

      const assistantMessage = completion.choices[0].message.content;
      const tokensUsed = completion.usage.total_tokens;

      // Add assistant message
      await chat.addMessage('assistant', assistantMessage, tokensUsed);

      // Reload chat to get updated data
      const updatedChat = await Chat.findById(chat._id);

      res.json({
        message: 'Message sent successfully',
        chat: {
          id: updatedChat._id,
          title: updatedChat.title,
          messages: updatedChat.messages,
          totalTokens: updatedChat.totalTokens,
          lastActivity: updatedChat.lastActivity
        },
        usage: {
          tokens: tokensUsed,
          model: model || chat.model
        }
      });

    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      
      // Add error message to chat
      await chat.addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again later.');

      res.status(500).json({
        error: {
          message: 'Error getting AI response. Please try again.',
          status: 500,
          details: openaiError.message
        }
      });
    }

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      error: {
        message: 'Error processing message.',
        status: 500
      }
    });
  }
});

// Update chat title
router.patch('/:chatId', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: {
          message: 'Title is required.',
          status: 400
        }
      });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, userId: req.user._id },
      { title: title.trim() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        error: {
          message: 'Chat not found.',
          status: 404
        }
      });
    }

    res.json({
      message: 'Chat title updated successfully',
      chat: {
        id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity
      }
    });

  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Error updating chat title.',
        status: 500
      }
    });
  }
});

// Delete chat
router.delete('/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        error: {
          message: 'Chat not found.',
          status: 404
        }
      });
    }

    res.json({
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Error deleting chat.',
        status: 500
      }
    });
  }
});

// Archive/Unarchive chat
router.patch('/:chatId/archive', async (req, res) => {
  try {
    const { archived = true } = req.body;

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, userId: req.user._id },
      { isArchived: archived },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        error: {
          message: 'Chat not found.',
          status: 404
        }
      });
    }

    res.json({
      message: `Chat ${archived ? 'archived' : 'unarchived'} successfully`,
      chat: {
        id: chat._id,
        title: chat.title,
        isArchived: chat.isArchived
      }
    });

  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Error updating chat archive status.',
        status: 500
      }
    });
  }
});

module.exports = router;
