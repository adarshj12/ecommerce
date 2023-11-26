const express = require('express');
const { addCategory, addProduct, viewCategories, viewProducts, editProduct, productUpdation, editCategory, categoryUpdation, removeCategory, removeProduct, newOffer, getOffers, deleteOffer } = require('../controllers/productController');
const router = express.Router();
const multer = require('../config/multer');
const { loginPage, getUsers, block, categoryPage, getAllOrders, getUserOrder, changeOrderStatus, addProductPage, addCategoryPage, couponPage, createCoupon, deleteCoupon, banner, bannerChange, salesReportPage, monthwiseReport, datewiseReport, yearwiseReport, dashboard, viewBanner, adminLogin, adminLogout, refund, rzp_refund, refund_verification } = require('../controllers/admincontroller');
const { adminSession } = require('../utils/validation');

router.get('/',loginPage)

router.post('/',adminLogin);

router.get('/logout',adminSession,adminLogout)

router.get('/dashboard',adminSession,dashboard)

router.get('/products',adminSession,viewProducts);

router.get('/users',adminSession,getUsers);

router.get('/blockuser',adminSession,block);

router.get('/categories',adminSession,categoryPage);

router.get('/orders',adminSession,getAllOrders);

router.get('/order',adminSession,getUserOrder);

router.put('/prodStatus',adminSession,changeOrderStatus);

router.route('/addProduct').get(addProductPage).post(multer.array('image'),addProduct)

router.route('/addCategory').get(adminSession,addCategoryPage).post(adminSession,multer.single('image'),addCategory);

router.get('/editProduct',adminSession,editProduct)

router.put('/productedit',adminSession,multer.array('image'),productUpdation);

router.get('/editCategory',adminSession,editCategory);

router.put('/categoryedit',adminSession,multer.single('image'),categoryUpdation);

router.get('/deletecategory',adminSession,removeCategory);

router.get('/deleteproduct',removeProduct);

router.route('/offers').get(adminSession,getOffers).post(adminSession,newOffer);

router.get('/removeOffer',adminSession,deleteOffer);

router.route('/coupons').get(adminSession,couponPage).post(adminSession,createCoupon);

router.get('/removeCoupon',adminSession,deleteCoupon);

router.route('/banner').post(adminSession,multer.single('image'),banner).put(adminSession,multer.single('image'),bannerChange);

router.get('/reports',adminSession,salesReportPage);

router.get('/monthly',adminSession,monthwiseReport);

router.get('/daily',adminSession,datewiseReport);

router.get('/yearly',adminSession,yearwiseReport);

router.get('/banner',adminSession,viewBanner);

router.post('/refund_initiate',adminSession,refund);

router.post('/rzp_refund',rzp_refund);

router.post('/refund_verification',refund_verification);

module.exports=router;