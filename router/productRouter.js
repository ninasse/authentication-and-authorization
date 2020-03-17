const express = require('express');
const Product = require('../model/product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('./verifyToken');
const router = express.Router();


router.route('/products')

    .get(async (req, res) => {
        const productsPerPage = 4;
        const page = +req.query.page; // Number(req.query.page)
        // HITTA ANTALET PRODUKTER I DATABASEN
        const countProducts = await Product.find().countDocuments();

        const products = await Product.find().populate('user email')
            .skip(productsPerPage * (page - 1))
            .limit(productsPerPage);
        res.render('product', { // PRODUKTLISTAN
            products,
            // ANTALET PRODUKTER I LISTAN 
            countProducts,
            // SIDAN SOM URL VISAR; AKTUELL SIDA
            currentPage: page,
            // FINNS DET SIDOR EFTER?
            hasNextPage: productsPerPage < page * productsPerPage,
            // FINNS DET SIDOR FÖRE?
            hasPrevPage: page > 1,
            // SISTA SIDAN
            lastPage: Math.ceil(countProducts / productsPerPage),
            // FÖREGÅENDE SIDA
            nextPage: page + 1,
            // NÄSTA SIDA
            prevPage: page - 1
        })
    })

router.route('/createproduct')
    .get(async (req, res) => {
        await new Product({
            name: 'Handbag',
            price: 1099,
            desc: 'Leather',
            user: '5e60cda65d6da92b2c9149b3'
        }).save();
        res.redirect('/products')
    })

module.exports = router;