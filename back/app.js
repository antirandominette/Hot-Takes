require('dotenv').config(); 

const env = process.env;
const express = require('express');
const mongoose = require('mongoose');
const saucesRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');
const helmet = require("helmet");

mongoose.set('strictQuery', false); // To avoid the error: "strictQuery: true, strict: true, and strict mode are not compatible with each other"
mongoose.connect(`mongodb+srv://${env.MONGO_USER_NAME}:${env.MONGO_USER_PASSWORD}@${env.MONGO_CLUSTER_ADDRESS}`, 
    { useNewUrlParser: true, 
    useUnifiedTopology: true }
)
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express(); // Create an Express application

app.use(helmet(), helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // To avoid security issues && to avoid CORS errors
app.use(express.json()); // Parse the request body to JSON

app.use((req, res, next) => { // To avoid CORS errors
    res.setHeader('Access-Control-Allow-Origin', '*'); // '*' to allow all origins
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // To allow the use of headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // To allow the use of methods

    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes); 

module.exports = app;