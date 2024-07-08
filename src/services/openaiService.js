const OpenAI = require('openai');
const roomService = require('./roomService');
const sequelize = require('../config/database');

const openai = new OpenAI({
    apiKey: "process.env.OPENAI_API_KEY",
    baseURL: "https://api.openai.com/v1" // Switch to official OpenAI API endpoint
});
const userContext = {};

const clearUserContext = () => {
    Object.keys(userContext).forEach(key => delete userContext[key]);
};
  
  // Add this function after your other functions
  const resetApplication = async () => {
    try {
        // Reset database
        await sequelize.sync({ force: true });
        console.log('Database reset');

        // Clear in-memory data
        clearUserContext();
        console.log('User context cleared');

        console.log('Application reset complete');
    } catch (error) {
        console.error('Error resetting application:', error);
        throw error;
    }
};

const processMessage = async (messages) => {
    try {
        const userMessage = messages[messages.length - 1].content.toLowerCase();
        
        // Handle common greetings
        if (['hi', 'hello', 'hey'].includes(userMessage)) {
            return 'Hello! How can I assist you today?';
        }

        console.log('Sending request to OpenAI API...');
        console.log('Messages:', JSON.stringify(messages));

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            functions: [
                {
                    name: "get_room_options",
                    description: "Get available room options",
                    parameters: {
                        type: "object",
                        properties: {},
                        required: []
                    }
                },
                {
                    name: "book_room",
                    description: "Book a room",
                    parameters: {
                        type: "object",
                        properties: {
                            roomId: { type: "integer" },
                            fullName: { type: "string" },
                            email: { type: "string" },
                            nights: { type: "integer" }
                        },
                        required: ["roomId", "fullName", "email", "nights"]
                    }
                }
            ],
            function_call: "auto"
        });

        console.log('Received response from OpenAI API:', JSON.stringify(completion));

        if (!completion.choices || completion.choices.length === 0) {
            throw new Error('No response from OpenAI API');
        }

        const responseMessage = completion.choices[0].message;

        if (!responseMessage) {
            throw new Error('Invalid response structure from OpenAI API');
        }

        if (responseMessage.function_call) {
            const functionName = responseMessage.function_call.name;
            const functionArgs = JSON.parse(responseMessage.function_call.arguments);

            console.log(`Function call detected: ${functionName}`);
            console.log('Function arguments:', functionArgs);

            let functionResult;
            if (functionName === "get_room_options") {
                functionResult = await roomService.getRoomOptions();
            } else if (functionName === "book_room") {
                // Check if user details are provided
                if (!functionArgs.fullName || !functionArgs.email) {
                    return {
                        askForDetails: true,
                        message: 'Please provide your full name and email to proceed with the booking.'
                    };
                }
                functionResult = await roomService.bookRoom(functionArgs);
            }

            console.log('Function result:', functionResult);

            const secondResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    ...messages,
                    responseMessage,
                    {
                        role: "function",
                        name: functionName,
                        content: JSON.stringify(functionResult)
                    }
                ]
            });

            console.log('Received second response from OpenAI API:', JSON.stringify(secondResponse));

            if (!secondResponse.choices || secondResponse.choices.length === 0) {
                throw new Error('No response from OpenAI API in second call');
            }

            return secondResponse.choices[0].message.content;
        }

        // Add fallback response for unrecognized commands
        if (!responseMessage.content) {
            return "I'm terribly sorry, but I'm not quite sure how to help with that. However, I can assist you with booking a room. How can I help you today?";
        }

        return responseMessage.content;
    } catch (error) {
        console.error('Error in OpenAI service:', error);
        if (error.response) {
            console.error('OpenAI API error response:', error.response.data);
        } else if (error.message.includes('No response from OpenAI API')) {
            // Custom handling for service interruption
            return "The OpenAI service is currently unavailable. Please try again later.";
        }
        throw error;
    }
};

module.exports = { processMessage, resetApplication, clearUserContext };
