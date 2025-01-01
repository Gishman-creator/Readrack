const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./src/routes/apiRoutes'); // Ensure this is correct
const { sendEmail } = require('./src/services/emailService');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const serverless = require('serverless-http');
const prod = process.env.NODE_ENV === "production";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || '*', // Use your frontend's domain for better security
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'], // Explicitly specify transports
});

app.use(bodyParser.json());
app.use(cors());

if (!prod) {
  // Socket.IO connection
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
} else {
  const socket = io('https://api.readrack.net', {
    transports: ['websocket', 'polling'],
  });
  socket.on('connect', () => {
    console.log('Connected to Socket.IO server:', socket.id);
  });
  socket.on('disconnect', (reason) => {
    console.log('Disconnected from Socket.IO server:', reason);
  });
}

// Add a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to readrack');
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
