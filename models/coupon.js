const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    minBound:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    users:[mongoose.Schema.Types.ObjectId],
    expiry:{
        type:Date,
        required:true
    }
})

module.exports=mongoose.model('coupon',couponSchema)