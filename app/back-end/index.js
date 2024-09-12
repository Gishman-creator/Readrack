const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./src/routes/apiRoutes'); // Ensure this is correct
const { sendEmail } = require('./src/services/emailService');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const serverless = require('serverless-http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this to your frontend origin for security
    methods: ['GET', 'POST'],
  },
});

app.use(bodyParser.json());
app.use(cors());

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Pass io to routes that need it
app.use('/api', (req, res, next) => {
  req.io = io;  // Attach io to req object
  next();
}, apiRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`App listening from port ${PORT}...`);
});

// Export the app for serverless environments
// module.exports.handler = serverless(app);
