const Category = require('../models/category');
const Product = require('../models/product');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const Offer = require('../models/offer');
const Banner = require('../models/banner');
const Coupon = require('../models/coupon')

const getCategories = async () => {
    try {
        const categories = await Category.find();
        return categories;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const getProducts = async () => {
    try {
        const products = await Product.aggregate([
            {
                $match: {
                    'deleted': { $ne: true }
                }
            },
            {
                '$lookup': {
                    'from': 'categories',
                    'localField': 'category',
                    'foreignField': '_id',
                    'as': 'category'
                }
            }, {
                '$unwind': {
                    'path': '$category'
                }
            }, {
                '$project': {
                    '_id': 1,
                    'name': 1,
                    'addedDate': 1,
                    'price': 1,
                    'category.name': 1,
                    'photos.image_url': 1,
                    'stock': 1
                }
            },

        ])
        return products;
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}
const editProd = async (prodId) => {
    try {
        const product = await Product.findById(prodId);
        const prodCategory = await Category.findById(product.category)
        return [product, prodCategory.name];
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const editCat = async (catId) => {
    try {
        const category = await Category.findById(catId);
        return category;
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const updateProduct = async (proId, data, imageArr) => {
    try {
        const product = await Product.findById(proId);
        const imageIndices = data.image.map(Number);
        data.productPrice = parseInt(data.productPrice)
        data.productStock = parseInt(data.productStock)
        const catname = await Category.findOne({ name: data.productCategory });
        await Product.findByIdAndUpdate(proId, {
            $set: {
                name: data.productName,
                description: data.productDescription,
                price: data.productPrice,
                stock: data.productStock,
                category: catname._id
            }
        })
        let counter = 0;
        for (let i = 0; i < product.photos.length; i++) {
            if (!imageIndices.includes(i)) {
                const photo = product.photos[i];
                await cloudinary.uploader.destroy(photo.image_id);
                const newFile = imageArr[counter % imageArr.length];
                const result = await cloudinary.uploader.upload(newFile.path);
                const imageData = {
                    image_url: result.secure_url,
                    image_id: result.public_id
                }
                await Product.findOneAndUpdate(
                    { _id: proId, 'photos._id': new mongoose.Types.ObjectId(photo._id) },
                    {
                        $set: {
                            'photos.$.image_url': imageData.image_url,
                            'photos.$.image_id': imageData.image_id,
                        },
                    },
                    { new: true }
                )
                counter++;
            }
        }
        return true;
    } catch (error) {
        console.log('error ',error.message);
        return false;
    }
}

const updateCategory = async (catId, data, image) => {
    try {
        await Category.findByIdAndUpdate(catId, { $set: { name: data.categoryName } });
        if (data.image) return true;
        else {
            const result = await cloudinary.uploader.upload(image.path);
            const image_Data = {
                image_url: result.secure_url,
                image_id: result.public_id
            }
            await Category.findByIdAndUpdate(catId, { $set: { image: image_Data.image_url } });
        }
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const deleteCategory = async (catId) => {
    try {
        await Category.findByIdAndDelete(catId);
        await Product.deleteMany({ category: catId })
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

//destroy cloudinary image
const deleteProduct = async (prodId) => {
    try {
        const product = await Product.findById(prodId);
        await Category.findByIdAndUpdate(product.category, { $inc: { "products": -1 } })
        // await Product.findByIdAndDelete(prodId);
        await Product.findByIdAndUpdate(prodId, { $set: { deleted: true } })
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const getCategoriesWithOffer = async () => {
    try {
        const offers = await Offer.aggregate([
            {
                '$lookup': {
                    'from': 'categories',
                    'localField': 'category',
                    'foreignField': '_id',
                    'as': 'category'
                }
            }, {
                '$unwind': {
                    'path': '$category'
                }
            }
        ])
        return offers
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const addOffer = async (catId, discount, expiry) => {
    try {
        const newOffer = new Offer({
            category: catId,
            discount,
            expiry
        })
        await newOffer.save();
        await Category.findByIdAndUpdate(catId, {
            $set: {
                offer: true
            }
        })
        const float = 1 - discount / 100;
        await Product.updateMany(
            { category: catId },
            [
                {
                    $set: {
                        price: {
                            $toInt: {
                                $multiply: ["$price", float]
                            }
                        }
                    }
                }
            ]
        )
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const removeOffer = async (offerId, catId) => {
    try {
        const offer = await Offer.findById(offerId);
        const discount = offer.discount;
        await Offer.findByIdAndDelete(offerId)
        await Category.findByIdAndUpdate(catId, { $set: { offer: false } })
        await Product.updateMany(
            { category: catId },
            [
                {
                    $set: {
                        price: {
                            $toInt: {
                                $multiply: [
                                    { $divide: [1, { $subtract: [1, { $divide: [discount, 100] }] }] },
                                    "$price"
                                ]
                            }
                        }
                    }
                }
            ]
        )
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const prodStat = async (prodId) => {
    try {
        const product = await Product.findById(prodId);
        if (product.stock === 0) return false;
        else return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const addbanner = async (text, image, prodId) => {
    try {
        const result = await cloudinary.uploader.upload(image.path);
        const data = {
            image_url: result.secure_url,
            image_id: result.public_id
        }
        const newBanner = new Banner({
            photo: data,
            product: prodId,
            text
        })
        await newBanner.save();
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const editBanner = async (text, image, product) => {
    try {
        const banner = await Banner.findOne();
        await cloudinary.uploader.destroy(banner.photo.image_id);
        const result = await cloudinary.uploader.upload(image.path);
        const data = {
            image_url: result.secure_url,
            image_id: result.public_id
        }
        await Banner.findByIdAndUpdate(banner._id, {
            $set: {
                text,
                "photo.image_url": data.image_url,
                "photo.image_id": data.image_id,
                product
            }
        })
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const getBanner = async () => {
    try {
        const banner = await Banner.findOne();
        return banner;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const getDeals = async () => {
    try {
        const offer = await Offer.find();
        let productsWithDiscount = [];

        await Promise.all(offer.map(async (elem) => {
            const category = await Category.findById(elem.category);
            const products = await Product.find({ category: category._id }).populate('category');

            productsWithDiscount.push(...products.map((product) => ({
                ...product.toObject(),
                discount: elem.discount,
                expiry: elem.expiry
            })));
        }));
        return productsWithDiscount;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const categoryGraph = async () => {
    try {
        const data = await Category.aggregate([
            {
                '$project': {
                    '_id': 0,
                    'name': 1,
                    'products': 1
                }
            }
        ])
        return data;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const prodSearch = async (string) => {
    try {
        const regex = new RegExp(string,'i'); 
        const products = await Product.find({ name: regex, deleted: { $ne: true } });
        return products
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const getCoupons=async()=>{
    try {
        const coupons = await Coupon.find();
        return coupons;
    } catch (error) {
        console.log(error.message);
        return false
    }
}


module.exports = {
    getCategories,
    getProducts,
    editProd,
    updateProduct,
    editCat,
    updateCategory,
    deleteProduct,
    deleteCategory,
    getCategoriesWithOffer,
    addOffer,
    removeOffer,
    prodStat,
    getDeals,
    addbanner,
    editBanner,
    getBanner,
    categoryGraph,
    prodSearch,
    getCoupons
}