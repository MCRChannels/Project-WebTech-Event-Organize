const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const apiRoutes = require('./src/routes/apiRoutes.js');
const viewRoutes = require('./src/routes/viewRoutes.js');
const cloudinary = require('cloudinary');
const cookieParser = require('cookie-parser');

dotenv.config();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => { console.log('MongoDB is connected successfully'); })
    .catch((err) => { console.error(`Error connect MongoDB :${err.message}`); });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/v1', apiRoutes);
app.use('/', viewRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});