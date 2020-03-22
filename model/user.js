const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wishlist: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    }],
    resetToken: { type: String },
    expToken: { type: Date }
})

// FUNKTIONEN ADDTOWISHLIST ANROPAS I USERROUTE.JS DÄR WISHLIST-ROUTE SKAPAS.
// PRODUCT KOMMER FRÅN PRODUCT-MODELLEN
userSchema.methods.addToWishlist = function (product) {
    this.wishlist.push({ productId: product._id })

    // FILTER GER OSS VÄRDET PÅ VARJE ENSKILT OBJEKT I ARRAYEN
    // ARRAY DISTRUCTURING
    const newWishlist = this.wishlist.filter(function ({ productId }) {
        return !this.has(`${productId}`) && this.add(`${productId}`)
    }, new Set)
    console.log(newWishlist);
    this.wishlist = [...newWishlist]
    return this.save();
}

// FUNKTIONEN REMOVEFROMWISHLIST TAR ALLA PRODUKTER SOM INTE HAR SAMMA VÄRDE SOM PRODUCTID OCH SPARAR I EN ARRAY SOM HETER FILTEREDWISHLIST.
userSchema.methods.removeFromWishlist = function (productId) {
    const filteredWishList = this.wishlist.filter((product) => {
        return product.productId.toString() !== productId.toString()
    })

    this.wishlist = filteredWishList;
    return this.save();
}
const User = mongoose.model('User', userSchema);

module.exports = User;