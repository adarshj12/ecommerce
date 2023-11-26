const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    image_url: {
        type: String,
        required: true
    },
    image_id: {
        type: String,
        required: true
    }
});
const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    addedDate:{
        type:Date,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    photos: {
        type: [ImageSchema]
    },
    stock:{
        type:Number,
        required:true
    },
    deleted:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('product',productSchema);