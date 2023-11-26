const express = require('express');
const { 
    home, 
    login, 
    loginPage, 
    registerPage, 
    register, 
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
    rzp_checkout, 
    place_order_data, 
    transaction_failed, 
    verification, 
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
} = require('../controllers/usercontroller');
const { sessionOut } = require('../utils/validation');

const router = express.Router();

router.get('/',home)

router.route('/login').get(loginPage).post(login);

router.route('/register').get(registerPage).post(register);

router.get('/logout',logout);

router.get('/products',products);

router.get('/product',product);

router.get('/addtocart',sessionOut,addToCart);

router.get('/cart',sessionOut,getCart);

router.get('/updateCart',sessionOut,updateCart);

router.get('/removeCartProd',sessionOut,removeProd);

router.get('/empty',sessionOut,clearCart);

router.get('/checkout',sessionOut,checkoutPage)

router.post('/checkout_initiate',sessionOut,place_order_data);

router.get('/checkoutfailed',sessionOut,transaction_failed)

router.post('/rzp_checkout',sessionOut,rzp_checkout);

router.post('/rzp_verification',sessionOut,verification);

router.post('/paypal_checkout',sessionOut,paypal_checkout);

router.get('/success',paypal_verify);

router.post('/couponcheck',sessionOut,couponCheck);

router.post('/search',searchProduct);

router.get('/cod',sessionOut,cashOnDelivery);

router.get('/ordersuccess',sessionOut,orderPlaced)

router.put('/prodStatus',sessionOut,changeOrderStatus);

router.get('/otplogin',OTPPage);

router.get('/otp',requestOTP);

router.get('/verify',validateOTP);

//**************************************PROFILE***************************************************//

router.get('/account',sessionOut,profileHome);

router.get('/profile',sessionOut,profilePage);

router.get('/orders',sessionOut,orders)

router.get('/orderproducts',sessionOut,orderProd)

router.route('/address')
    .get(sessionOut,address)
    .put(sessionOut,addAddress)
    .delete(sessionOut,removeAddress)
    .patch(sessionOut,addressEdit)

router.get('/editaddress',sessionOut,editAddress);

router.put('/updateprofile',sessionOut,editProfile)

//**************************************PROFILE***************************************************//

module.exports=router;