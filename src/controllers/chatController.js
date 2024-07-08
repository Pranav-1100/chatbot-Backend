const openaiService = require('../services/openaiService');
const roomService = require('../services/roomService');
const Conversation = require('../models/Conversation');

exports.handleChat = async (req, res) => {
  try {
    console.log('Received chat request:', req.body);
    const { message, userId } = req.body;

    if (!message || !userId) {
      console.log('Invalid request: missing message or userId');
      return res.status(400).json({ error: 'Message and userId are required.' });
    }

    // Retrieve or create conversation history
    let [conversation, created] = await Conversation.findOrCreate({
      where: { userId },
      defaults: { messages: [] }
    });

    console.log('Conversation retrieved/created:', conversation.toJSON());

    // Add user message to conversation history
    conversation.messages = [...conversation.messages, { role: 'user', content: message }];

    // Process message with OpenAI
    let openaiResponse;
    try {
      console.log('Processing message with OpenAI...');
      openaiResponse = await openaiService.processMessage(conversation.messages);
      console.log('OpenAI response received:', openaiResponse);
      // if (typeof openaiResponse === 'object' && openaiResponse.emailSent !== undefined) {
      //   if (openaiResponse.emailSent) {
      //     openaiResponse.content += " A confirmation email has been sent to your email address.";
      //   } else {
      //     openaiResponse.content += " We couldn't send a confirmation email at this time, but your booking is confirmed.";
      //   }
      // }
    } catch (error) {
      console.error('Error processing message with OpenAI:', error);
      return res.status(500).json({ error: 'An error occurred while processing your message.' });
    }

    // Add AI response to conversation history
    conversation.messages = [...conversation.messages, { role: 'assistant', content: openaiResponse }];

    // Save updated conversation
    await conversation.save();
    console.log('Conversation saved:', conversation.toJSON());

    res.json({ response: openaiResponse });
  } catch (error) {
    console.error('Error in chat handler:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};