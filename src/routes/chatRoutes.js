const express = require('express');
const chatController = require('../controllers/chatController');
const authenticateJWT = require('../middleware/authMiddleware');


const router = express.Router();

router.post('/chat', authenticateJWT, chatController.handleChat);

module.exports = router; 