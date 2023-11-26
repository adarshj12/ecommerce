const mongoose = require('mongoose');
const User = require('../models/user');
const Product = require('../models/product')
const Category = require('../models/category');
const Cart = require('../models/cart');
const Order = require('../models/order')
const Checkout = require('../models/checkout');
const { totalAmount } = require('./cartHelpers');
const Refund = require('../models/refund');

const temp_data = async (address, user, payment_method, couponApplied, coupon, couponAmount) => {
    try {
        const newOrder = new Checkout({
            address,
            user,
            payment_method,
            couponApplied,
            coupon,
            couponAmount:couponAmount !== 'NaN' ? couponAmount : 0
        })
        await newOrder.save();
        return newOrder;
    } catch (error) {
        console.log('kk',error.message);
        return false;
    }
}

const placeOrder = async (receipt) => {
    try {
        const temp_data = await Checkout.findOne();
        const cart = await Cart.findOne({ user: temp_data.user });
        const amount = await totalAmount(temp_data.user)
        const orderProducts = cart.products.map((product) => ({
            item: product.item,
            quantity: product.quantity,
            status: 'placed',
        }));
        orderProducts.forEach(async (elem) => {
            await Product.findByIdAndUpdate(elem.item, { $inc: { "stock": -1 } })
        })
        const couponApplied = temp_data.couponApplied
        const couponAmount = temp_data.couponAmount

        const newOrder = new Order({
            deliveryAddress: temp_data.address,
            user: temp_data.user,
            paymentMode: temp_data.payment_method,
            status: 'placed',
            paymentReceipt: receipt,
            products: orderProducts,
            amount: amount[0].totalAmount,
            orderDate: new Date(),
            couponApplied: couponApplied,
            coupon: temp_data.coupon,
            couponAmount: couponAmount,
            totalAmount: amount[0].totalAmount - couponAmount,
        });
        await newOrder.save().then(async (res) => {
            await Checkout.deleteOne();
            await Cart.deleteOne({ user: temp_data.user })
        })
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const userOrders = async (userId) => {
    try {
        const orders = await Order.aggregate([
            {
                '$match': {
                    'user': new mongoose.Types.ObjectId(userId)
                }
            }, {
                '$sort': {
                    'orderDate': -1
                }
            }
        ])
        return orders
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const userOrderProducts = async (orderId) => {
    try {
        const orderProducts = await Order.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(orderId)
                }
            }, {
                '$unwind': {
                    'path': '$products'
                }
            }, {
                '$lookup': {
                    'from': 'products',
                    'localField': 'products.item',
                    'foreignField': '_id',
                    'as': 'result'
                }
            }, {
                '$unwind': {
                    'path': '$result'
                }
            }, {
                '$project': {
                    '_id': 1,
                    'deliveryAddress': 1,
                    'paymentMode': 1,
                    'products._id': 1,
                    'products.item': 1,
                    'products.quantity': 1,
                    'products.status': 1,
                    'amount': 1,
                    'coupon':1,
                    'couponAmount':1,
                    'totalAmount':1,
                    'orderDate': 1,
                    'result.name': 1,
                    'result.price': 1,
                    'result.photos': 1
                }
            }
        ])
        return orderProducts
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const allOrders = async () => {
    try {
        const orders = await Order.aggregate([
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user'
                }
            }, {
                '$project': {
                    '_id': 1,
                    'user.name': 1,
                    'user.mobile': 1,
                    'orderDate': 1,
                    'paymentMode': 1,
                    'totalAmount': 1
                }
            }, {
                '$sort': {
                    'orderDate': -1
                }
            }
        ]);
        return orders;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const orderDetail = async (orderId) => {
    try {
        const order = await Order.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(orderId)
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user'
                }
            }, {
                '$lookup': {
                    'from': 'products',
                    'localField': 'products.item',
                    'foreignField': '_id',
                    'as': 'result'
                }
            }, {
                '$project': {
                    '_id': 1,
                    'user._id': 1,
                    'user.name': 1,
                    'user.mobile': 1,
                    'user.email': 1,
                    'orderDate': 1,
                    'paymentMode': 1,
                    'paymentReceipt': 1,
                    'totalAmount': 1,
                    'deliveryAddress': 1,
                    'products': 1,
                    'result': 1
                }
            }
        ])
        return order;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const changeStatus = async (orderId, prodId, newStatus) => {
    try {
        const update = await Order.updateOne(
            {
                _id:new mongoose.Types.ObjectId(orderId) ,
                'products._id': prodId
            }, {
            $set: {
                'products.$.status': newStatus
            }
        },{new:true})
        return update;
    } catch (error) {
        console.log('status change error ',error.message);
        return false
    }
}

const monthlyReport = async (month) => {
    try {
        const categories = await Category.find();

        const salesData = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(2023, month, 1),
                        $lt: new Date(2023, month + 1, 1)
                    },
                    status: "placed"
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
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $group: {
                    _id: "$category._id",
                    categoryName: { $first: "$category.name" },
                    totalSaleAmount: { $sum: "$product.price" }
                }
            },
            {
                $project: {
                    _id: 0,
                    categoryName: 1,
                    totalSaleAmount: 1
                }
            }
        ]);
        const salesMap = new Map();
        salesData.forEach((item) => {
            salesMap.set(item.categoryName, item.totalSaleAmount);
        });
        const output = categories.map((category) => ({
            categoryName: category.name,
            totalSaleAmount: salesMap.get(category.name) || 0
        }));

        // console.log(output);
        return output;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const dailyReport = async (date1, date2) => {
    try {
        const startDate = new Date(date1);
        const endDate = new Date(date2);
        const categories = await Category.find();

        const salesData = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: startDate,
                        $lt: endDate
                    },
                    status: "placed"
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
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $group: {
                    _id: "$category._id",
                    categoryName: { $first: "$category.name" },
                    totalSaleAmount: { $sum: "$product.price" }
                }
            },
            {
                $project: {
                    _id: 0,
                    categoryName: 1,
                    totalSaleAmount: 1
                }
            }
        ]);

        const salesMap = new Map();
        salesData.forEach((item) => {
            salesMap.set(item.categoryName, item.totalSaleAmount);
        });

        const output = categories.map((category) => ({
            categoryName: category.name,
            totalSaleAmount: salesMap.get(category.name) || 0
        }));

        // console.log('daily data',output);
        return output;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const yearlyReport = async (year) => {
    try {
        const categories = await Category.find();

        const salesData = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${parseInt(year) + 1}-01-01`)
                    },
                    status: "placed"
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
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $group: {
                    _id: "$category._id",
                    categoryName: { $first: "$category.name" },
                    totalSaleAmount: { $sum: "$product.price" }
                }
            },
            {
                $project: {
                    _id: 0,
                    categoryName: 1,
                    totalSaleAmount: 1
                }
            }
        ]);
        const salesMap = new Map();
        salesData.forEach((item) => {
            salesMap.set(item.categoryName, item.totalSaleAmount);
        });
        const output = categories.map((category) => ({
            categoryName: category.name,
            totalSaleAmount: salesMap.get(category.name) || 0
        }));

        // console.log(output);
        return output;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const getRevenue = async () => {
    try {
        const result = await Order.aggregate([
            {
                '$unwind': '$products'
            },
            {
                '$match': {
                    'products.status': 'delivered'
                }
            },
            {
                '$lookup': {
                    'from': 'products',
                    'localField': 'products.item',
                    'foreignField': '_id',
                    'as': 'product'
                }
            },
            {
                '$unwind': '$product'
            },
            {
                '$addFields': {
                    'totalPrice': { '$multiply': ['$product.price', '$products.quantity'] }
                }
            },
            {
                '$group': {
                    '_id': null,
                    'totalAmount': { '$sum': '$totalPrice' }
                }
            }
        ])
        const totalSum = result.length > 0 ? result[0].totalAmount : 0;
        return totalSum;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const monthlyRevenue = async () => {
    try {
        const month = new Date().getMonth() + 1;
        const result = await Order.aggregate([
            {
                '$match': {
                    '$expr': {
                        '$eq': [{ '$toInt': { '$substr': ['$orderDate', 5, 2] } }, month]
                    }
                }
            },
            {
                '$unwind': '$products'
            },
            {
                '$match': {
                    'products.status': 'delivered'
                }
            },
            {
                '$lookup': {
                    'from': 'products',
                    'localField': 'products.item',
                    'foreignField': '_id',
                    'as': 'product'
                }
            },
            {
                '$unwind': '$product'
            },
            {
                '$addFields': {
                    'totalPrice': { '$multiply': ['$product.price', '$products.quantity'] }
                }
            },
            {
                '$group': {
                    '_id': null,
                    'totalAmount': { '$sum': '$totalPrice' }
                }
            }
        ]);
        const totalSum = result.length > 0 ? result[0].totalAmount : 0;
        return totalSum;
    } catch (error) {
        console.log(error.message);
        return false
    }
}


const paymentMethodData = async () => {
    try {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentMode",
                    count: { $sum: 1 }
                }
            }
        ])
        return result;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const dailyOrders = async () => {
    try {
        // const today = new Date();
        // today.setHours(0, 0, 0, 0); 

        // const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); 

        // const data = await Order.aggregate([
        //     {
        //         $match: {
        //             orderDate: { $gte: thirtyDaysAgo, $lt: today } 
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: {
        //                 year: { $year: "$orderDate" },
        //                 month: { $month: "$orderDate" },
        //                 day: { $dayOfMonth: "$orderDate" }
        //             },
        //             count: { $sum: 1 }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             date: {
        //                 $dateFromParts: {
        //                     year: "$_id.year",
        //                     month: "$_id.month",
        //                     day: "$_id.day"
        //                 }
        //             },
        //             count: 1
        //         }
        //     }
        // ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); 

        const dateRange = [];

        for (let i = 0; i < 30; i++) {
            const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
            const day = date.getDate();
            dateRange.push(day);
        }

        const data = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: thirtyDaysAgo, $lt: today } 
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    date: { $dayOfMonth: { $dateFromString: { dateString: "$_id" } } },
                    count: 1,
                    _id: 0
                }
            },
            {
                $group: {
                    _id: null,
                    data: { $push: { date: "$date", count: "$count" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    data: {
                        $map: {
                            input: dateRange,
                            as: "date",
                            in: {
                                date: "$$date",
                                count: {
                                    $ifNull: [
                                        {
                                            $let: {
                                                vars: {
                                                    matchingOrder: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$data",
                                                                    as: "item",
                                                                    cond: { $eq: ["$$item.date", "$$date"] }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                },
                                                in: "$$matchingOrder.count"
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$data"
            },
            {
                $replaceRoot: {
                    newRoot: "$data"
                }
            }
        ]);
        return data;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}


const refundDoc=async(user,amount,order,product)=>{
    try {
        const newRefund=new Refund({
            user,
            amount,
            order,
            product
        })
        await newRefund.save();
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const onlinerefund=async()=>{
    try {
        const refund = await Refund.findOne();
        await User.findByIdAndUpdate(refund.user,{$inc:{wallet:refund.amount}})
        await Order.updateOne(
            {
                _id: refund.order,
                'products._id': refund.product
            }, {
            $set: {
                'products.$.status': 'refunded'
            }
        })
        await Refund.deleteOne()
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

module.exports = {
    temp_data,
    placeOrder,
    userOrders,
    userOrderProducts,
    allOrders,
    orderDetail,
    changeStatus,
    monthlyReport,
    dailyReport,
    yearlyReport,
    getRevenue,
    monthlyRevenue,
    paymentMethodData,
    dailyOrders,
    onlinerefund,
    refundDoc
}