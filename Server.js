const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./config/db');
require('./model/index'); 
require('dotenv').config();
const app = express();
app.use(express.json());
const path = require('path');
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('uploads directory created');
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadDir));

app.use(
  session({
    secret: process.env.ACCESS_SECRET_TOKEN,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

(async () => {
    await db.sync();
    console.log("Tables created successfully");
})();

// Root route
app.get('/', (req, res) => {
    res.send('Welcome');
  });
// Post route
app.post('/', (req, res) => {
  res.send('Post request submitted');
});

//Admin Route
const adminRoutes = require('./routes/adminRoutes');
app.use('/api', adminRoutes);

//Business Route
const businessRoutes = require('./routes/businessRoutes');
app.use('/api', businessRoutes);

//Member Route
const memberRoutes = require('./routes/memberRoutes');
app.use('/api', memberRoutes);

// Ratings Route
const ratingsRoutes = require('./routes/ratingsRoutes');
app.use('/api', ratingsRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api', notificationRoutes);

const categoriesRoutes = require('./routes/categoriesRoutes');
app.use('/api', categoriesRoutes);

// Member Family routes
const memberFamilyRoutes = require('./routes/memberFamilyRoutes');
app.use('/api', memberFamilyRoutes);


// Listen on the port from the .env file
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});