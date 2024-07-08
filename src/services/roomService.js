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

async function bookRoom(roomId, fullName, email, nights) {
  console.log('Booking room:', roomId, fullName, email, nights);
  try {
    const response = await axios.post('https://bot9assignement.deno.dev/book', {
      roomId:roomId,
      fullName: fullName,
      email: email,
      nights: nights
    });
    console.log('Room booked:', response.data); 
    return response.data;
    
  } catch (error) { 
    console.error('Error booking room:', error);
    return null;
  }
}
module.exports = { getRoomOptions, bookRoom };
