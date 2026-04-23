const { Server } = require("socket.io");

// Assuming io is passed from app.js or we can require it
// For now, we'll assume it's available

const receiveSensorData = (req, res) => {
  const { sensorData } = req.body; // Assuming Arduino sends { sensorData: { temp: 25, humidity: 60, etc. } }

  if (!sensorData) {
    return res.status(400).json({ error: 'No sensor data provided' });
  }

  console.log('Received sensor data:', sensorData);

  // Emit to all connected clients
  req.io.emit('sensorData', sensorData);

  res.status(200).json({ message: 'Sensor data received and broadcasted', data: sensorData });
};

module.exports = {
  receiveSensorData
};