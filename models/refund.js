const mongoose = require('mongoose');

const refundSchema=new mongoose.Schema({
    user:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    order:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    product:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    }
})

module.exports=mongoose.model('refund',refundSchema)