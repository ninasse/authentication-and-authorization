const express = require('express');
const Product = require('../model/product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('./verifyToken');
const router = express.Router();


router.route('/products')

    .get(async (req, res) => {
        const productsPerPage = 4;
        const page = Number(req.query.page)
        // HITTA ANTALET PRODUKTER I DATABASEN
        const productAmount = await Product.find().countDocuments();

        const products = await Product.find().populate('user -password')
            .skip(productsPerPage * (page - 1))
            .limit(productsPerPage)
        res.render('product', {
            //ANTAL PRODUKTER SOM VISAS PER SIDA
            productsPerPage,
            // PRODUKTLISTAN
            products,
            // ANTALET PRODUKTER I DATABASEN/ LISTAN 
            productAmount,
            // SIDAN SOM URL VISAR; AKTUELL SIDA
            currentPage: page,
            // FINNS DET SIDOR EFTER?
            hasNextPage: productsPerPage < page * productsPerPage,
            // FINNS DET SIDOR FÖRE?
            hasPrevPage: page > 1,
            // SISTA SIDAN
            lastPage: Math.ceil(productAmount / productsPerPage),
            // FÖREGÅENDE SIDA
            nextPage: page + 1,
            // NÄSTA SIDA
            prevPage: page - 1
        })
    })

router.route('/createproduct')
    .get(verifyToken, async (req, res) => {
        await new Product({
            name: 'Socks',
            price: 599,
            desc: 'Silk',
            user: req.body.user._id
        }).save();
        res.redirect('/products')
    })

module.exports = router;
