require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: 'http://127.0.0.1:5501',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// // Security Middleware
// app.use(helmet());
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5501',
//   credentials: true
// }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per window
});
app.use('/api/', limiter);

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// MySQL Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3305,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'samuel',
  database: process.env.DB_NAME || 'learning_management_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database Initialization
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(100) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_courses (
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

// JWT Utilities (Example)
const jwt = require('jsonwebtoken');
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'weuygcjhjeguiisuhskj', { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'weuygcjhjeguiisuhskj', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// API Endpoints
app.post('/api/register', async (req, res) => {
  try {
    const { firstname, lastname, email, phonenumber, password, confirmpassword } = req.body;
    
    if (password !== confirmpassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    const username = `${firstname.toLowerCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      `INSERT INTO users (username, first_name, last_name, email, phone, password_hash) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, firstname, lastname, email, phonenumber, passwordHash]
    );
    
    const token = generateToken(result.insertId);
    res.status(201).json({ token, username, userId: result.insertId });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(error.code === 'ER_DUP_ENTRY' ? 400 : 500).json({ 
      error: error.code === 'ER_DUP_ENTRY' ? 'Email already exists' : 'Registration failed' 
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [username, username]
    );
    
    if (users.length === 0 || !(await bcrypt.compare(password, users[0].password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const token = generateToken(user.id);
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        name: `${user.first_name} ${user.last_name}`
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected Routes
app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const [user] = await pool.query(
      `SELECT username, first_name, last_name FROM users WHERE id = ?`,
      [req.user.id]
    );
    
    const [courses] = await pool.query(
      `SELECT c.id, c.name FROM courses c
       JOIN user_courses uc ON c.id = uc.course_id
       WHERE uc.user_id = ?`,
      [req.user.id]
    );
    
    res.json({ user: user[0], courses });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});


// Add this to your existing backend routes
app.post('/api/forgot_password/verify-otp', async (req, res) => {
  const { otp, email } = req.body;
  const conn = await pool.getConnection();
  
  try {
    // Verify OTP from database
    const [resetRecord] = await conn.query(
      `SELECT id FROM password_resets 
       WHERE email = ? AND otp = ? AND expires_at > NOW() AND used = FALSE`,
      [email, otp]
    );

    if (!resetRecord.length) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired OTP' 
      });
    }

    // Mark OTP as verified (but not used yet)
    await conn.query(
      `UPDATE password_resets SET verified = TRUE WHERE id = ?`,
      [resetRecord[0].id]
    );

    res.json({ 
      success: true,
      reset_token: crypto.randomBytes(32).toString('hex') // Generate a new token for password reset
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  } finally {
    conn.release();
  }
});


// Initialize and Start Server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MySQL connected to ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3305}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

