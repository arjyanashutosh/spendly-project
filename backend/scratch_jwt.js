const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
try {
  const token = jwt.sign({ id: new mongoose.Types.ObjectId() }, 'secret');
  console.log('token ok:', token);
} catch (e) {
  console.error('jwt crash:', e.message);
}
