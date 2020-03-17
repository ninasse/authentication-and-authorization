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

userSchema.methods.addToWishlist = function (product) {
    this.wishlist.push({ productId: product._id })
    return this.save();
}
const User = mongoose.model('User', userSchema);

module.exports = User;