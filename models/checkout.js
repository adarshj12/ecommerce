const mongoose = require('mongoose');

const chktSchema=new mongoose.Schema({
    address:{
        type:String,
        required:true
    },
    user:{
        type:String,
        required:true
    },
    payment_method:{
        type:String,
        required:true
    },
    couponApplied:{
        type:Boolean,
    },
    coupon:{
        type:String,
    },
    couponAmount:{
        type:Number
    }
})

module.exports=mongoose.model('temp',chktSchema);