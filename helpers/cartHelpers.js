const mongoose = require('mongoose');
const User = require('../models/user');
const Product = require('../models/product')
const Category = require('../models/category');
const Cart = require('../models/cart');
const Order = require('../models/order')


const cartData = async (userId) => {
    try {
        const cart = await Cart.aggregate([
            {
                '$match': {
                    'user': new mongoose.Types.ObjectId(userId)
                }
            },
            {
                '$unwind': "$products"
            },
            {
                '$lookup': {
                    'from': "products",
                    'localField': "products.item",
                    'foreignField': "_id",
                    'as': "productDetails"
                }
            },
            {
                '$project': {
                    '_id': 1,
                    'product': {
                        '$arrayElemAt': ["$productDetails", 0]
                    },
                    'quantity': "$products.quantity"
                }
            }
        ])
        return cart;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}



const totalAmount = async (userId) => {
    try {
        const total = await Cart.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.item",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    _id: 0,
                    totalAmount: { $multiply: ["$product.price", "$products.quantity"] }
                }
            },
            {
                $group: {
                    _id: 0,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ])
        return total;
    } catch (error) {
        console.log('break', error.message);
        return false;
    }
}

const checkoutData = async (userId) => {
    try {
        // const userId = req.query.id;
        const total = await Cart.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.item",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    _id: 0,
                    totalAmount: { $multiply: ["$product.price", "$products.quantity"] }
                }
            },
            {
                $group: {
                    _id: 0,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ])
        const result = await Cart.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.item",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    _id: 0,
                    "product.name": 1,
                    "products.quantity": 1,
                    totalPrice: {
                        $multiply: ["$products.quantity", "$product.price"]
                    }
                }
            }
        ])
        return [result, total]
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const getCartCount = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId });
        if (cart) {
            const value = await Cart.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $project: {
                        cartLength: { $size: "$products" }
                    }
                }
            ])
            const count = value[0].cartLength;
            return count;
        }
        return 0;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const emptyCart = async (cartId) => {
    try {
        const cart = await Cart.findById(cartId);
        if (cart.products.length > 1) {
            cart.products.forEach(async (elem) => {
                await Cart.findOneAndUpdate(
                    {
                        _id: cartId,
                    },
                    {
                        $pull: { 'products': { _id: elem._id } }
                    },
                    { new: true }
                );
            });
        }
        return 'cart deleted';
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

module.exports = {
    totalAmount,
    checkoutData,
    getCartCount,
    emptyCart,
    cartData
}