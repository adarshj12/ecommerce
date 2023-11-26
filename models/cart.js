const mongoose = require('mongoose');

const cartProductSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})


const cartSchema = new mongoose.Schema({
    user: {
        type:  mongoose.Schema.Types.ObjectId,
        required: true
    },
    products:[cartProductSchema]
})

module.exports = mongoose.model('cart', cartSchema);