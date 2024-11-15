const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const User = require('./User');
const app = express()


dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () { console.log('Connected to MongoDB'); });

app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: 'https://b3o33bdrhiuwehsr3fuqphmkxyzjnddvnzxj43wdpzjhsj3o67vw5hid.onion',
     methods: 'GET, POST, OPTIONS',
      allowedHeaders: ['DNT', 'User-Agent', 'X-Requested-With', 'If-Modified-Since', 'Cache-Control', 'Content-Type'], credentials: true }));

    

app.post('/register', async (req, res) => { 
    try {
         const { username, password } = req.body;
          
           const user = new User({ username, password: password });
            await user.save(); res.status(201).send('User registered successfully');
      } catch (error) { 
        res.status(500).send(error.message);
 } })

app.get('/protected', async (req, res) => {
  try {
         const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
           const user = await User.findById(decoded.id);
            res.send(`Hello, ${user.username}`);
         }
          catch (error) { 
            console.log(error)
            res.status(401).send('Unauthorized');
           }
 });

app.post('/login', async (req, res) => {
     try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if(user==null)
            return res.status(401).send('Invalid credentials');
        else{
            const isMatch = await user.comparePassword(password);
            
            if (isMatch == false)
                return res.status(401).send('Invalid credentials');
            else{
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            }
          
        }
        } catch (error) {
             console.log(error.message);
 } }); 


const port = 3001

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})