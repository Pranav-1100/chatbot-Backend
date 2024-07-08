const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/database');
const Conversation = require('./models/Conversation');
const User = require('./models/User'); // Add this line
const { processMessage, resetApplication, clearUserContext } = require('./services/openaiService');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api', chatRoutes);
app.use('/api/auth', authRoutes); // Add this line

const PORT = process.env.PORT || 3000;

// Sync database and start server
sequelize.sync({ force: true }).then(() => {
  console.log('Database synced');
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

app.post('/reset', async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    clearUserContext();
    res.status(200).json({ message: 'Data reset successful' });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});
