const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/database');
const Conversation = require('./models/Conversation');
const User = require('./models/User');
// const { processMessage, resetApplication, clearUserContext } = require('./services/openaiService');
require('dotenv').config();

const app = express(); 

app.use(cors());
app.use(bodyParser.json());
app.use('/api', chatRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

// Sync database and start server
sequelize.sync({ force: false }).then(async () => {
  console.log('Database synced');
  
  // // Reset data on server start
  // await resetApplication();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// app.post('/reset', async (req, res) => {
//   try {
//     await resetApplication();
//     res.status(200).json({ message: 'Data reset successful' });
//   } catch (error) {
//     console.error('Error resetting data:', error);
//     res.status(500).json({ error: 'Failed to reset data' });
//   } 
// });