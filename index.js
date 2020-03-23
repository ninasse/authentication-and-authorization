const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const userRoutes = require('./router/userRoutes');
const productRoutes = require('./router/productRouter');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(userRoutes);
app.use(productRoutes);

app.set('view engine', 'ejs');

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
};

const PORT = process.env.PORT || 8001;
mongoose.connect(config.databaseURL, options).then(() => {
    app.listen(PORT);
    console.log('app listening to port ' + PORT)
})