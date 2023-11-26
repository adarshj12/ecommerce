const User = require('../models/user');
const Order = require('../models/order')
const Coupon = require('../models/coupon')

const getAllUsers = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const blockUsers = async (userId) => {
    try {
        await User.findOneAndUpdate({ _id: userId }, [{ $set: { isBlocked: { $eq: [false, "$isBlocked"] } } }]);
        return true;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const addCoupon=async(data)=>{
    try {
        const newCoupon = new Coupon({
            ...data
        })
        await newCoupon.save();
        return true;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const removeCoupon =async(couponId)=>{
    try {
        await Coupon.findByIdAndDelete(couponId);
        return true;
    } catch (error) {
        console.log(error.message);
        return false
    }
}




module.exports = {
    getAllUsers,
    blockUsers,
    addCoupon,
    removeCoupon,
}