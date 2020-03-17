const mongoose = require('mongoose');

const productSchema = {
    name: { type: String },
    price: { type: Number },
    desc: { type: String },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // REFERERAR TILL MODELLEN SOM OBJECTID HÄMTAS FRÅN
    }
}

const product = mongoose.model('Product', productSchema);

module.exports = product