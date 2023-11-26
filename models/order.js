const mongoose = require('mongoose');

const OrderProductSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

const orderSchema = new mongoose.Schema({
    deliveryAddress: {
        type:String,
        required:true
    },
    user: {
        type:  mongoose.Schema.Types.ObjectId,
        required: true
    },
    paymentMode: {
        type: String,
        required: true
    },
    paymentReceipt: {
        type: String,
    },
    status:{
        type:String,
        required: true
    },
    products:{
        type: [OrderProductSchema]
    },
    amount:{
        type: Number,
        required: true
    },
    orderDate:{
        type:Date,
        required:true
    },
    couponApplied:{
        type:Boolean,
        default:false
    },
    coupon:{
        type:String
    },
    couponAmount:{
        type:Number,
        default:0
    },
    totalAmount:{
        type:Number,
        required:true
    }
})


module.exports = mongoose.model('order', orderSchema);