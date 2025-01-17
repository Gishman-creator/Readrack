const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const apiRoutes = require('./src/routes/apiRoutes'); // Ensure this is correct
const poolpg = require('./src/config/dbpg');
const { SitemapStream, streamToPromise } = require('sitemap'); // Import new utilities
const { Readable } = require('stream');
const { sendEmail } = require('./src/services/emailService');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const prod = process.env.NODE_ENV === "production";

// Import `socket.io-client` for client-side connection
const { io: clientIo } = require('socket.io-client');

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
  // Server-Side Socket.IO connection
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
} else {
  // Client-Side Socket.IO connection
  const socket = clientIo('https://api.readrack.net', {
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

app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    // Fetch series and authors from your database
    const series = await poolpg.query('SELECT id, serie_name FROM series');
    const authors = await poolpg.query('SELECT id, author_name FROM authors');

    // Generate URLs for series and authors
    const seriesUrls = series.rows.map(serie => ({
      url: `/series/${serie.id}/${serie.serie_name.toLowerCase().split(' ').join('-')}`,
      changefreq: 'weekly',
      priority: 0.8
    }));

    const authorsUrls = authors.rows.map(author => ({
      url: `/authors/${author.id}/${author.author_name.toLowerCase().split(' ').join('-')}`,
      changefreq: 'weekly',
      priority: 0.8
    }));

    // Combine the URLs for series and authors
    const urls = [...seriesUrls, ...authorsUrls];

    // Create a stream for generating the sitemap
    const sitemapStream = new SitemapStream({
      hostname: 'https://readrack.net',
    });

    // Convert the URLs to a readable stream and pipe them to the sitemap stream
    const xml = await streamToPromise(Readable.from(urls).pipe(sitemapStream));

    // Ensure the 'downloads' directory exists, if not, create it
    const downloadDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }

    // Define the path to save the sitemap file
    const filePath = path.join(downloadDir, 'sitemap.xml');

    // Write the sitemap XML to the 'downloads' folder
    fs.writeFileSync(filePath, xml.toString(), 'utf8');

    res.header('Content-Type', 'application/xml');
    res.header('Content-Disposition', 'attachment; filename="sitemap.xml"');
    res.send(xml.toString());
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});


// Pass io to routes that need it
app.use('/api', (req, res, next) => {
  req.io = io;  // Attach io to req object
  next();
}, apiRoutes);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`App listening from port ${PORT}...`);
});

// Export the app for serverless environments
// module.exports.handler = serverless(app);
