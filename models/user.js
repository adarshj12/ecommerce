const mongoose = require('mongoose');

const addressSchema=new mongoose.Schema({
    customername:{
        type:String,
    },
    contactnumber:{
        type:String
    },
    customeremail:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    pincode:{
        type:String
    }
})
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    wallet:{
        type:Number,
        default:0
    },
    address:[addressSchema]
})

module.exports=mongoose.model('user',userSchema);