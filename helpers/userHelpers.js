const mongoose = require('mongoose');
const User = require('../models/user');
const Coupon = require('../models/coupon');
const { emailvalidate, passwordValidate, mobileValidate } = require('../utils/validation');
const bcrypt = require('bcrypt');

const registerUser = async (data) => {
    try {
        const { name, email, mobile, password } = data;
        if (!emailvalidate(email)) {
            return 'invalid email format'
        }
        if (!passwordValidate(password)) {
            return 'password should contain atleast 1 uppercase,1 lowercase, and alphanumerics with minimum 6 characters';
        }
        if (!mobileValidate(mobile)) {
            return 'invalid email format'
        }
        let userExist = await User.findOne({ email }) || await User.findOne({ mobile })
        if (userExist) {
            return 'user already registered'
        }
        const salt = bcrypt.genSaltSync(10);
        let hashpassword = bcrypt.hashSync(password, salt);
        const newUser = new User({
            name,
            email,
            password: hashpassword,
            mobile
        })
        await newUser.save();
        return 'user registration successful';
    } catch (error) {
        console.log(error.message);
        return 'user registration failed'
    }
}

const loginUser = async (data) => {
    try {
        const { email, password } = data;
        const user = await User.findOne({ email });
        if (!user) {
            return 'user does not exist'
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return 'invalid email or password'
        }
        if (user.isBlocked) {
            return 'you are blocked'
        }
        return user;
    } catch (error) {
        console.log(error.message);
        return 'user login failed'
    }
}

const userDetails =async(userId)=>{
    try {
        const user = await User.findById(userId);
        return user;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const validateCoupon = async (userId, couponName, amount) => {
    try {
        const coupon = await Coupon.findOne({ name: couponName })
        if (!coupon) return 'invalid coupon'
        if (coupon.users.includes(userId)) return 'coupon already applied'
        if (amount < coupon.minBound) return `coupon not valid for amounts below ${minBound}`
        await Coupon.findByIdAndUpdate(coupon._id, { $push: { users: userId } });
        return [coupon.discount, 'coupon applied'];
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const deleteAddress = async (userId, addrId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $pull: {
                "address": { _id: addrId }
            }
        })
        return 'address deleted';
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const particularAddress = async (userId, addrId) => {
    try {
        const data = await User.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(userId)
                }
            }, {
                '$unwind': "$address"
            }, {
                '$match': {
                    "address._id": new mongoose.Types.ObjectId(addrId)
                }
            }, {
                '$project': {
                    '_id': 0,
                    'address': 1
                }
            }
        ])
        return data[0].address;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const updateAddress = async (userId, addrId, data) => {
    try {
        await User.updateOne(
            {
                _id: new mongoose.Types.ObjectId(userId),
                "address._id": new mongoose.Types.ObjectId(addrId)
            }, {
            $set: {
                "address.$.customername": data.customername,
                "address.$.contactnumber" : data.contactnumber,
                "address.$.customeremail" : data.customeremail,
                "address.$.city" : data.city,
                "address.$.state" : data.state,
                "address.$.pincode" : data.pincode
            }
        })
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const findUserByMobile=async(mobile)=>{
    try {
        const user=await User.findOne({mobile});
        if(user) return user;
        return 'user not registered' 
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const updateUser=async(userId,data)=>{
    try {
        const {username,useremail,usermobile,userpassword}=data;
        const salt = bcrypt.genSaltSync(10);
        let password = bcrypt.hashSync(userpassword, salt);
        const updatedUser=await User.findByIdAndUpdate(userId,{$set:{
            name:username,
            email:useremail,
            password,
            mobile:usermobile
        }},{new:true})
        return updatedUser;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

module.exports = {
    validateCoupon,
    registerUser,
    loginUser,
    deleteAddress,
    particularAddress,
    updateAddress,
    findUserByMobile,
    userDetails,
    updateUser
}