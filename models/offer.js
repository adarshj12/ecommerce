const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    category:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    expiry:{
        type:Date,
        required:true
    }
})


module.exports=mongoose.model('offer',offerSchema)