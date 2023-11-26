const mongoose = require('mongoose');

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    addedDate:{
        type:Date,
        required:true
    },
    products:{
        type:Number,
        default:0
    },
    image:{
        type:String,
        required:true
    },
    offer:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('category',categorySchema);