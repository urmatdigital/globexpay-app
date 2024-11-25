const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const telegramRoutes = require('./routes/telegram.routes');
app.use('/api', telegramRoutes);

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth', 'login.html'));
});

app.get('/auth/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth', 'register.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
