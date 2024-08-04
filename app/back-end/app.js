const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./src/routes/apiRoutes');
const { sendEmail } = require('./src/services/emailService'); // Adjust the path as necessary
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api', apiRoutes);

// Example route to send an email
app.post('/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;

  try {
    const messageId = await sendEmail(to, subject, text, html);
    res.status(200).json({ message: 'Email sent successfully', messageId });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App listening from port ${PORT}...`);
});
