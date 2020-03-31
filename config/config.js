require('dotenv').config();

// process.env.variabelnamn

const config = {
    databaseURL: process.env.DATABASE,
    mail: process.env.MAIL
};


module.exports = config;