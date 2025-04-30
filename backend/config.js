// backend/lms.js (or app.js)
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const jwtSecret = process.env.JWT_SECRET;
const apiUrl = process.env.API_URL;

// Use these variables within your backend code
