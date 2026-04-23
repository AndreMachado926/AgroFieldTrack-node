const express = require('express');
const router = express.Router();
const arduinosController = require('../controllers/ArduinosController');

module.exports = (io) => {
  // Pass io to controller if needed, but for now, in controller we can access it via req.app.get('io') but since it's not middleware.

  // Actually, since io is global, but to make it clean, perhaps attach to req.

  router.use((req, res, next) => {
    req.io = io;
    next();
  });

  router.post('/sensor-data', arduinosController.receiveSensorData);

  return router;
};