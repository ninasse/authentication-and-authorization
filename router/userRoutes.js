const express = require('express');
const User = require('../model/user');
const Product = require('../model/product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('./verifyToken');
const config = require('../config/config');
const nodemailer = require('nodemailer');
const nodemailerSendGridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const router = express.Router();

const transport = nodemailer.createTransport(nodemailerSendGridTransport({
    auth: {
        api_key: config.mail
    }
}))

router.route('/')

    .get((req, res) => {
        res.render('index.ejs')
    })

router.route('/signup')

    .get((req, res) => {
        res.render("signup.ejs")
    })

    .post(async (req, res) => {
        const salt = await bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = await new User({
            email: req.body.email,
            password: hashPassword
        }).save();

        transport.sendMail({
            to: newUser.email,
            from: 'noreply@testapp.se',
            subject: 'Account created',
            html: '<h1>Wellcome' + newUser.name + '</h1>'
        })

        const user = await User.find({ email: req.body.email });
        // res.redirect('/')
        res.send('Congrats! You just created an account!')
    })

router.route('/login')

    .get((req, res) => {
        res.render('login.ejs');
    })

    .post(async (req, res) => {

        const user = await User.findOne({ email: req.body.loginemail })

        // OM USER INTE FINNS I DB REDIRECT TILL SIGNUP
        if (!user) return res.redirect('/signup')

        // JÄMFÖR LÖSENORDET MED LÖSENORDET I DB
        const validUser = await bcrypt.compare(req.body.loginpassword, user.password)

        // OM LÖSENORDET ÄR FEL REDIRECT TILL LOGIN
        if (!validUser) return res.redirect('/login')
        else {
            jwt.sign({ user }, 'hemlignyckel', (err, token) => {

                if (err) return res.redirect('/login')
                console.log(token)

                if (token) {
                    // FÖR ATT KUNNA LÄSA JSONWEBTOKEN KRÄVS COOKIE-PARSER
                    const cookie = req.cookies.jsonwebtoken;

                    // OM COOKIE INTE FINNS SÅ SKA EN COOKIE SKAPAS
                    if (!cookie) {
                        res.cookie('jsonwebtoken', token, { maxAge: 36000000, httpOnly: true })
                    }
                }
                // OM LÖSENORDET STÄMMER VISA USERPROFILE
                res.render('userProfile', { user })
            })
        }
    })

router.route('/useraccount')
    .get(verifyToken, (req, res) => {
        console.log('Body .user är', req.user)
        res.send('You are authorized')
    })

router.route('/logout')
    .get((req, res) => {
        res.clearCookie('jsonwebtoken').redirect('/login')
    })

router.route('/resetpw')
    .get((req, res) => {
        res.render('resetpw');
    })

    .post(async (req, res) => {
        const isUser = await User.findOne({ email: req.body.resetMail });
        if (!isUser) return res.redirect('/signup');

        crypto.randomBytes(32, async (err, token) => {
            if (err) return res.redirect('/signup');
            const resetToken = token.toString('hex');

            isUser.resetToken = resetToken;
            isUser.expToken = Date.now() + 1000000;
            await isUser.save();

            await transport.sendMail({
                to: isUser.email,
                from: '<no-reply>Medieinstitutettestar@test.se',
                subject: 'Password reset link',
                html: `Reset password link: http://localhost:8001/reset/${resetToken}`
            })
        })
        res.redirect('/login');
    })

router.route('/reset/:token')
    .get(async (req, res) => {
        // OM ANVÄNDAREN HAR ETT GILTIGT TOKEN VISAS ETT FORMULÄR.

        //req.params.token

        const user = await User.findOne({ resetToken: req.params.token, expToken: { $gt: Date.now() } })

        if (!user) return res.redirect('/signup');

        res.render('resetForm', { user });
    })

    .post(async (req, res) => {
        //req.body.password
        //req.body.userId

        const user = await User.findOne({ _id: req.body.userId })
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetToken = undefined;
        user.expToken = undefined;
        await user.save();

        res.redirect('/login');
    })

router.route('/wishlist')
    .get(verifyToken, async (req, res) => {
        const user = await User.findOne({ _id: req.body.user._id }).populate('wishlist.productId')

        res.render('wishlist', { user })
    })

router.route('/wishlist/:id')
    .get(verifyToken, async (req, res) => {
        //req.params.id
        // HÄMTA EN SPECIFIK PRODUKT
        const product = await Product.findOne({ _id: req.params.id })

        // HÄMTA EN SPECIFIK USER
        const user = await User.findOne({ _id: req.body.user._id })
        await user.addToWishlist(product)

        res.redirect('/wishlist')
    })

router.route('/deletefromwishlist/:id')
    .get(verifyToken, async (req, res) => {

        const user = await User.findOne({ _id: req.body.user._id })
        user.removeFromWishlist(req.params.id)
        res.redirect('/wishlist');
    });

module.exports = router;

