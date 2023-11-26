const { getAllUsers, blockUsers, removeCoupon, addCoupon } = require("../helpers/adminHelpers");
const { allOrders, orderDetail, changeStatus, monthlyReport, dailyReport, yearlyReport, getRevenue, monthlyRevenue, paymentMethodData, dailyOrders, refundDoc, onlinerefund } = require("../helpers/orderHelpers");
const { getCategories, addbanner, editBanner, getBanner, getProducts, categoryGraph, getCoupons } = require("../helpers/productHelpers");
const { getCategoryNames } = require("./productController");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { instance } = require('../config/razorpay');

const loginPage = (req, res) => {
    res.render('admin/login', { errorMessage: null })
}

const adminLogin = async (req, res) => {
    try {
          
        const { username, password } = req.body;
        if ((username !== process.env.ADMIN_USERNAME) || (password !== process.env.ADMIN_PASSWORD))
            // return res.status(203).json({ message: `username error` });
            res.render('admin/login', { errorMessage: 'invalid credentials' })
        else {
            req.session.admin = username;
            req.session.adminLoggedIn = true
            const token = jwt.sign({ name: "admin", admin: true }, process.env.SECRET, { expiresIn: "10h" });
            // res.status(202).json({ message: 'login successful', token })
            res.redirect('/admin/dashboard')
        }

    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const adminLogout=(req,res)=>{
    try {
        req.session.admin = null
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const dashboard = async (req, res) => {
    try {
          
        const products = await getProducts();
        const categories = await getCategories();
        const users = await getAllUsers();
        const revenue = await getRevenue();
        const monthlyRev = await monthlyRevenue();
        const paymentModeChart = await paymentMethodData();
        const graph1 = await dailyOrders();
        const catGraph = await categoryGraph()
        res.render('admin/dashboard', { prodCount: products.length, catCount: categories.length, userCount: users.length, revenue, monthlyRev, paymentModeChart, graph1, catGraph })
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const categoryPage = async (req, res) => {
    try {
          
        const categories = await getCategories();
        res.render('admin/category', { categories })
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}


const getUsers = async (req, res) => {
    try {
          
        const users = await getAllUsers();
        res.render('admin/users', { users })
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const block = async (req, res) => {
    try {
          
        await blockUsers(req.query.id)
        res.status(200).json('user toggled')
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const getAllOrders = async (req, res) => {
    try {
          
        const orders = await allOrders();
        res.render('admin/orders', { orders })
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const getUserOrder = async (req, res) => {
    try {
          
        const order = await orderDetail(req.query.id);
        const addArr = order[0].deliveryAddress.split(',');
        order[0].deliveryAddress = addArr;
        res.render('admin/userorder', { order: order[0] })
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const changeOrderStatus = async (req, res) => {
    try {
          
        const statusChange = await changeStatus(req.query.order, req.body.product, req.body.change)
        if (statusChange) res.status(200).json('product status updated')
        else res.status(500).json('product status unchanged')
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const addProductPage = async (req, res) => {
    try {
          
        const categories = await getCategoryNames();
        res.render('admin/addproduct', { categories })
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const addCategoryPage = async (req, res) => {
    try {
          
        res.render('admin/addcategory')
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const couponPage = async (req, res) => {
    try {
          
        const coupons = await getCoupons();
        res.render('admin/coupons', { coupons })
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const createCoupon = async (req, res) => {
    try {
          
        await addCoupon(req.body);
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const deleteCoupon = async (req, res) => {
    try {
          
        await removeCoupon(req.query.id);
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const banner = async (req, res) => {
    try {
          
        await addbanner(req.body.text, req.file, req.body.id);
        res.json('banner added')
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const bannerChange = async (req, res) => {
    try {
          
        await editBanner(req.body.text, req.file, req.body.id);
        res.json('banner changed')
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const viewBanner = async (req, res) => {
    try {
          
        const banner = await getBanner();
        const products = await getProducts();
        res.render('admin/changebanner', { banner, products })
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const salesReportPage = async (req, res) => {
    try {
          
        res.render('admin/report')
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const monthwiseReport = async (req, res) => {
    try {
          
        console.log(req.query.id);
        const data = await monthlyReport(req.query.id);
        res.status(200).json(data)
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const datewiseReport = async (req, res) => {
    try {
          
        console.log(req.query.start, req.query.end);
        const data = await dailyReport(req.query.start, req.query.end);
        res.status(200).json(data)
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const yearwiseReport = async (req, res) => {
    try {
          
        console.log(req.query.year);
        const data = await yearlyReport(req.query.year);
        res.status(200).json(data)
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}


const refund=async(req,res)=>{
    try {
          
        await refundDoc(req.body.user,req.body.amount,req.body.orderId,req.body.productId);
        return res.status(200).json('refund inititated');
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const rzp_refund = async (req, res) => {
    try {
        var options = {
            amount: Number(req.body.amount * 100),
            currency: 'INR',
        };
        const order = await instance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(`razorpay error => ${error.message}`);
        res.status(500).json({ success: false, error: 'Error creating Razorpay order' });
    }
}

const refund_verification = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET)
        .update(body.toString())
        .digest('hex');
    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
        await onlinerefund();
        res.redirect('/admin/orders')
    } else {
        // res.status(400).json({ success: false })
        res.status(500).json('refund failed')
    }
};

module.exports = {
    loginPage,
    getUsers,
    block,
    categoryPage,
    getAllOrders,
    getUserOrder,
    changeOrderStatus,
    addProductPage,
    addCategoryPage,
    couponPage,
    createCoupon,
    deleteCoupon,
    banner,
    bannerChange,
    salesReportPage,
    monthwiseReport,
    datewiseReport,
    yearwiseReport,
    dashboard,
    viewBanner,
    adminLogin,
    adminLogout,
    refund,
    rzp_refund,
    refund_verification
}