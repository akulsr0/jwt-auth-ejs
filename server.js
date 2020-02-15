const express = require('express');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const db = require('./db');
const checkauth = require('./middlewares/checkauth');

const app = express();
const port = process.env.PORT || 5000;
const User = require('./models/User');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Login User (GET)
app.get('/', checkauth, async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    res.render('dashboard', { name: user.name });
  } catch (error) {
    res.status(500).json({ error: err });
  }
});

// Login User (POST)
app.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.find({ email: email });
    if (user.length > 0) {
      const authResult = await bcrypt.compare(password, user[0].password);
      if (authResult) {
        const token = jwt.sign(
          {
            id: user[0]._id
          },
          config.get('JWT_SECRET'),
          { expiresIn: '1h' }
        );
        res.cookie('token', token);
        res.render('dashboard', { name: user[0].name });
        return;
      }
      res.render('message', { message: 'Invalid Credentials' });
    } else {
      res.render('message', { message: 'Invalid Credentials' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

// Register User (GET)
app.get('/register', (req, res) => {
  res.render('register');
});

// Register User (POST)
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const checkExistingEmailUser = await User.find({ email });
    if (checkExistingEmailUser.length > 0) {
      return res.render('message', { message: 'User already exists' });
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPass });
    await user.save();
    res.render('message', { message: 'Registered Successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Start server
app.listen(port, () =>
  console.log(`Server is started at http://localhost:${port}`)
);
