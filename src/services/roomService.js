const axios = require('axios');

const API_BASE_URL = 'https://bot9assignement.deno.dev';

const getRoomOptions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rooms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room options:', error);
    throw error;
  }
};

const bookRoom = async ({ roomId, fullName, email, nights }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/book`, {
      roomId,
      fullName,
      email,
      nights
    });
    return response.data;
  } catch (error) {
    console.error('Error booking room:', error);
    throw error;
  }
};

module.exports = { getRoomOptions, bookRoom };
