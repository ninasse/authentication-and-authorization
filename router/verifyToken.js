const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    const token = req.cookies.jsonwebtoken;
    console.log(token)

    // KOLLA OM ANVÄNDAREN HAR COOKIE
    if (token) {
        // VERIFIERA OM USER HAR EN VALID TOKEN/ COOKIE
        const user = jwt.verify(token, 'hemlignyckel')
        console.log('user info: ', user);

        // VALIDERINGSDATA TILL SERVER
        req.user = user;
        next();
    }
    else {
        res.send('You are NOT authorized')
    }
}

