const mongoose = require('mongoose');
const User = require('../models/user');
const Product = require('../models/product')
const Category = require('../models/category');
const Cart = require('../models/cart')
const { emailvalidate, passwordValidate, mobileValidate } = require('../utils/validation');
const bcrypt = require('bcrypt');
const { totalAmount, checkoutData, getCartCount, emptyCart, cartData } = require('../helpers/cartHelpers');
const crypto = require('crypto');
const { instance } = require('../config/razorpay');
const { temp_data, placeOrder, userOrders, userOrderProducts, changeStatus } = require('../helpers/orderHelpers');
const paypal = require('paypal-rest-sdk');
paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_SECRET_KEY,
});
const CC = require('currency-converter-lt');
const { validateCoupon, deleteAddress, particularAddress, updateAddress, findUserByMobile, loginUser, userDetails, updateUser } = require('../helpers/userHelpers');
const { prodStat, getDeals, getBanner, prodSearch, getCoupons } = require('../helpers/productHelpers');
const { sendOTP, verifyOTP } = require('../services/twilio');


const home = async (req, res) => {
    const categories = await Category.find();
    const banner = await getBanner();
    req.session.returnTo = req.originalUrl;
    const deals = await getDeals();
    if (req.session.user) {
        const user = req.session.user;
        const userCart = await Cart.findOne({ user: user._id });
        if (userCart) {
            const cartCount = await getCartCount(user._id)
            res.render('user/home', { user, categories, cartCount, deals, banner })
        } else {

            res.render('user/home', { user, categories, cartCount: 0, deals, banner })
        }
    } else {
        res.render('user/home', { user: null, categories, deals, banner })
    }
}

const loginPage = (req, res) => {
    const user = req.session.user;
    if (!user) res.render('user/login', { errorMessage: null, user: null });
    else res.redirect(req.session.returnTo)
}

const registerPage = (req, res) => {
    const user = req.session.user;
    if (!user) res.render('user/signup', { errorMessage: null, user: null });
    else res.redirect(req.session.returnTo)
}

const login = async (req, res) => {
    try {
        const response = await loginUser(req.body)
        if (response==='user does not exist') {
            const errorMessage = 'user does not exist';
            return res.render('user/login', { errorMessage, user: null });
        }
        if (response==='invalid email or password') {
            const errorMessage = 'invalid email or password';
            return res.render('user/login', { errorMessage, user: null });
        }
        if (response==='you are blocked') {
            const errorMessage = 'you are blocked';
            return res.render('user/login', { errorMessage, user: null });
        }
        req.session.user = response
        res.redirect('/');
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const logout = (req, res) => {
    try {
        req.session.user = null;
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}

const register = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;
        if (!emailvalidate(email)) {
            const errorMessage = 'invalid email format';
            return res.render('user/signup', { errorMessage, user: null });
        }
        if (!passwordValidate(password)) {
            const errorMessage = 'password should contain atleast 1 uppercase,1 lowercase, and alphanumerics with minimum 6 characters';
            return res.render('user/signup', { errorMessage, user: null });
        }
        if (!mobileValidate(mobile)) {
            const errorMessage = 'invalid email format';
            return res.render('user/signup', { errorMessage, user: null });
        }
        let userExist = await User.findOne({ email }) || await User.findOne({ mobile })
        if (userExist) {
            const errorMessage = 'user already registered';
            return res.render('user/signup', { errorMessage, user: null });
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
        // res.status(201).json({ message: `user registered` })
        res.render('user/login', { errorMessage: null, user: null });
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const OTPPage=async(req,res)=>{
    try {
        res.render('user/OTPpage',{user:null})
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const requestOTP=async(req,res)=>{
    try {
        const request = await findUserByMobile(req.query.phonenumber);
        if(request=='user not registered') return res.json('unregistered');
        await sendOTP(req.query.phonenumber)
        res.json('user exist')
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const validateOTP=async(req,res)=>{
    try {
        const verification=await verifyOTP(req.query.phonenumber,req.query.code);
        if(verification=='verified'){
            const user=await findUserByMobile(req.query.phonenumber);
            req.session.user=user;
            return res.status(200).json('verified')
        } 
        res.status(200).json('invalid') 
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const products = async (req, res) => {
    try {

        const category = req.query.id;
        const cat = await Category.findById(category);
        let discount = 0;
        let aggr = [
            {
                offer: { discount: 0 }
            }
        ]
        if (cat.offer) {
            aggr = await Category.aggregate([
                {
                    '$lookup': {
                        'from': 'offers',
                        'localField': '_id',
                        'foreignField': 'category',
                        'as': 'offer'
                    }
                }, {
                    '$unwind': {
                        'path': '$offer'
                    }
                }, {
                    '$project': {
                        'offer.discount': 1
                    }
                }
            ])
        }
        discount = aggr[0].offer.discount;
        const products = await Product.find({ category, "deleted": { $ne: true } });
        if (req.session.user) {
            const user = req.session.user;
            const userCart = await Cart.findOne({ user });
            if (userCart) {
                const cartCount = userCart.products.length;
                res.render('user/products', { user, products, cartCount, discount })
            } else {
                res.render('user/products', { user, products, cartCount: 0, discount })
            }
        } else {

            res.render('user/products', { user: null, products, discount })
        }
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const product = async (req, res) => {
    try {

        const pId = req.query.id;
        const product = await Product.findById(pId);
        const cat = await Category.findById(product.category);
        let discount = 0;
        let aggr = [
            {
                offer: { discount: 0 }
            }
        ]
        if (cat.offer) {
            aggr = await Category.aggregate([
                {
                    '$lookup': {
                        'from': 'offers',
                        'localField': '_id',
                        'foreignField': 'category',
                        'as': 'offer'
                    }
                }, {
                    '$unwind': {
                        'path': '$offer'
                    }
                }, {
                    '$project': {
                        'offer.discount': 1
                    }
                }
            ])
        }
        discount = aggr[0].offer.discount;
        const productStatus = await prodStat(pId);
        let status;
        if (productStatus) status = true;
        else status = false
        if (req.session.user) {
            const user = req.session.user;
            const userCart = await Cart.findOne({ user: user._id });
            if (userCart) {
                const cartCount = userCart.products.length;
                res.render('user/product', { user, product, cartCount, discount, status })
            } else {
                res.render('user/product', { user, product, cartCount: 0, discount, status })
            }
        } else {

            res.render('user/product', { user: null, product, discount, status })
        }
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const addToCart = async (req, res) => {
    try {

        const userId = req.session.user._id
        // const userId = req.query.userId;
        const proId = req.query.id;
        const userCart = await Cart.findOne({ user: userId });
        if (userCart) {
            const cartItem = userCart.products.find(
                (item) => item.item.toString() === proId
            );
            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                userCart.products.push({
                    item: proId,
                    quantity: 1,
                });
            }
            await userCart.save();
        } else {
            const newCart = new Cart({
                user: userId,
                products: [{ item: proId, quantity: 1 }],
            });
            await newCart.save();
        }
        const cartCount = await Cart.findOne({ user: userId })
        res.status(200).json({ message: 'Product added to cart successfully', count: cartCount.products.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getCart = async (req, res) => {
    try {
        const userId = req.session.user._id
        const total = await totalAmount(userId);
        const cart = await cartData(userId)
        const cartCount = await getCartCount(userId);
        if (cartCount === 0) return res.render('user/emptycart', { user: req.session.user, cartCount })
        res.render('user/cart', { user: req.session.user, cart, cartCount, total: total[0].totalAmount })
        // res.status(200).json(cart)
    } catch (error) {
        // res.status(500).json({ error: error.message });
        res.render('error')
    }
}

const updateCart = async (req, res) => {
    try {

        const user = req.session.user;
        const proId = req.query.proId[1];
        const product = await Product.findById(proId)
        const count = parseInt(req.query.count[1]);
        const cart = await Cart.findOne({ user: user._id });
        let change = null;
        if (count < 0) {
            const cartProd = cart.products.find((product) =>
                product.item.equals(proId)
            );
            if (cartProd) {
                cartProd.quantity -= 1;
            }
            change = cartProd.quantity
        } else {
            const cartProd = cart.products.find((product) =>
                product.item.equals(proId)
            );
            if (cartProd) {
                if (cartProd.quantity < product.stock)
                    cartProd.quantity += 1;
                else return res.json('max count reached')
            }
            change = cartProd.quantity
        }
        await cart.save();
        res.status(200).json(change);
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}


const removeProd = async (req, res) => {
    try {

        const user = req.session.user;
        const result = await Cart.findOneAndUpdate(
            {
                user: user._id,
            },
            {
                $pull: { 'products': { item: req.query.proId } }
            },
            { new: true }
        );
        res.status(200).json('cart updated')
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const clearCart = async (req, res) => {
    try {

        await emptyCart(req.query.id)
        res.render('user/emptycart', {user:req.session.user, cartCount: 0 })
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const checkoutPage = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');   
        const user = req.session.user;
        const userId=user._id
        if (userId) {
            const user = await User.findById(userId);
            const checkoutDetails = await checkoutData(userId);
            const cartCount = await getCartCount(userId)
            if (cartCount > 0)
                res.render('user/checkout', { user, cartCount, products: checkoutDetails[0], total: checkoutDetails[1], addresses: user.address, couponMessage: null })
            else
                res.render('user/emptycart', { user, cartCount })
        } else {

            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const orderPlaced = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const user = req.session.user;
        res.render('user/orderplaced', {user, cartCount:0 })
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const place_order_data = async (req, res) => {
    try {

        const user = req.session.user;
        if (temp_data(req.body.address, req.body.userId, req.body.paymentMethod, req.body.couponApplied, req.body.coupon, req.body.couponAmount)) {
            res.status(200).json({ name: user.name, email: user.email, contact: user.mobile })
        } else res.status(500).json('checkout failed')
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}


const rzp_checkout = async (req, res) => {
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

const verification = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const user = req.session.user;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET)
        .update(body.toString())
        .digest('hex');
    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
        await placeOrder(razorpay_payment_id)
        // res.render('user/orderplaced', {user, cartCount: 0 })
        res.redirect('/ordersuccess')
    } else {
        // res.status(400).json({ success: false })
        res.render('user/orderfailed', { cartCount: 0 })
    }
};

const exchangeRate = async (inr) => {
    const fromCurrency = "INR";
    const toCurrency = "USD";
    const amountToConvert = inr;
    const currencyConverter = new CC({ from: fromCurrency, to: toCurrency, amount: amountToConvert });

    return new Promise((resolve, reject) => {
        currencyConverter.convert()
            .then((usd) => {
                const val = parseInt(Math.floor(usd).toFixed(2));
                resolve(val);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

let amount;

const paypal_checkout = async (req, res) => {
    const userId = req.session.user._id;
    const total = await totalAmount(userId);
    amount = await exchangeRate(total[0].totalAmount);
    const create_payment_json = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        redirect_urls: {
            // return_url: 'http://localhost:4000/success',
            // cancel_url: 'http://localhost:4000/checkoutfailed',
            return_url: 'https://techspire.onrender.com/success',
            cancel_url: 'https://techspire.onrender.com/checkoutfailed',
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: 'Product Name',
                            sku: 'PRODUCT_SKU',
                            price: amount,
                            currency: 'USD',
                            quantity: 1,
                        },
                    ],
                },
                amount: {
                    currency: 'USD',
                    total: amount,
                },
                description: 'Product Description',
            },
        ],
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
}

const paypal_verify = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: 'USD',
                    total: amount,
                },
            },
        ],
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            await placeOrder(payment.id)
            res.render('user/orderplaced', {user:req.session.user, cartCount: 0 })
        }
    });
}

const cashOnDelivery = async (req, res) => {
    try {
        await placeOrder()
        res.status(200).json('payment done')
    } catch (error) {
        console.log(error.message);
        res.render('error')
    }
}

const transaction_failed = async(req, res) => {
    const cartCount = await getCartCount(userId)
    res.render('user/orderfailed',{user:req.session.user,cartCount})
}

const couponCheck = async (req, res) => {
    try {

        const message = await validateCoupon(req.body.user, req.body.coupon, req.body.amount);
        res.status(200).json({ message })
    } catch (error) {
        console.log(error.message);
        res.status(200).json({ error: error.message })
    }
}

const searchProduct = async (req, res) => {
    try {

        const products = await prodSearch(req.body.search)

        if (req.session.user) {
            const user = req.session.user;
            const userCart = await Cart.findOne({ user: user._id });
            if (userCart) {
                const cartCount = userCart.products.length;
                res.render('user/searchresults', {user, products, cartCount })
            } else {
                res.render('user/searchresults', {user, products, cartCount: 0 })
            }
        } else {

            res.render('user/searchresults', {user:null, products })
        }
    } catch (error) {
        console.log(error.message)
        res.render('error')
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


//**************************************PROFILE***************************************************//

const profileHome = async (req, res) => {
    try {

        const user = req.session.user;
        const userData =await userDetails(user._id)
        const cartCount = await getCartCount(user._id);
        const coupons = await getCoupons();
        res.render('user/profile/home', {user:userData, cartCount,coupons })
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const orders = async (req, res) => {
    try {

        const user = req.session.user;
        const orders = await userOrders(user._id);
        const cartCount = await getCartCount(user._id)
        res.render('user/profile/orders', { cartCount, orders, user })
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const orderProd = async (req, res) => {
    try {

        const user = req.session.user;
        const cartCount = await getCartCount(user._id)
        const orderId = req.query.id;
        const products = await userOrderProducts(orderId);
        res.render('user/profile/orderProducts', { cartCount, products, user })
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const address = async (req, res) => {
    try {

        const userId = req.session.user._id;
        const cartCount = await getCartCount(userId)
        const user = await User.findById(userId);
        res.render('user/profile/addresses', { cartCount, addresses: user.address, user })
        // res.json(user.address)
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const editAddress=async(req,res)=>{
    try {
        const userId = req.session.user._id;
        const cartCount = await getCartCount(userId)
        const user = await User.findById(userId);
        const addressData=await particularAddress(userId,req.query.id);
        res.render('user/profile/editaddress', { cartCount, addressData, user })
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const addAddress = async (req, res) => {
    try {

        // const userId = req.query.id;
        const userId = req.session.user._id;
        const newAddress = req.body;
        await User.findByIdAndUpdate(userId, {
            $push: { address: newAddress }
        }, { new: true });
        res.status(201).json('address added')
        // res.redirect('/address')
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const removeAddress=async(req,res)=>{
    try {
        const userId=req.session.user._id;
        const deleteAddr = await deleteAddress(userId,req.query.id);
        if(deleteAddr) res.status(200).json('address deleted');
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const addressEdit=async(req,res)=>{
    try {
        
        await updateAddress(req.session.user._id,req.query.id,req.body)
        res.status(200).json('address updated')
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const profilePage=async(req,res)=>{
    try {
        const user = req.session.user;
        const userData =await userDetails(user._id)
        const cartCount = await getCartCount(user._id)
        res.render('user/profile/userProfile',{user:userData,cartCount})
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const editProfile=async(req,res)=>{
    try {
        const userId = req.query.id;
        const change=await updateUser(userId,req.body);
        res.status(200).json(change)
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

//**************************************PROFILE***************************************************//

module.exports = {
    loginPage,
    registerPage,
    register,
    login,
    home,
    logout,
    products,
    product,
    addToCart,
    getCart,
    updateCart,
    removeProd,
    clearCart,
    checkoutPage,
    profileHome,
    orders,
    address,
    addAddress,
    orderPlaced,
    place_order_data,
    rzp_checkout,
    verification,
    transaction_failed,
    paypal_checkout,
    paypal_verify,
    orderProd,
    couponCheck,
    searchProduct,
    changeOrderStatus,
    cashOnDelivery,
    removeAddress,
    editAddress,
    addressEdit,
    OTPPage,
    requestOTP,
    validateOTP,
    profilePage,
    editProfile
}