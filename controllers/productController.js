const Product=require('../models/product');
const Category = require('../models/category');
const cloudinary = require('../config/cloudinary');
const { getProducts, editProd, updateProduct, editCat, updateCategory, deleteCategory, deleteProduct, addOffer,getCategoriesWithOffer, removeOffer } = require('../helpers/productHelpers');

const addCategory=async(req,res)=>{
    try {
        const exist= await Category.findOne({name:req.body.name});
        if(exist) return res.status(403).json('category exists')
        const result = await cloudinary.uploader.upload(req.file.path);
            const data = {
                image_url: result.secure_url,
                image_id: result.public_id
            }
        const newCategory = new Category({
            name:req.body.name,
            addedDate:Date.now(),
            image:data.image_url
        });
        const savedCategory = await newCategory.save();
        // res.status(200).json(savedCategory);
        res.redirect('/admin/categories')
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}
const addProduct=async(req,res)=>{
    try {
        const arr = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path);
            const data = {
                image_url: result.secure_url,
                image_id: result.public_id
            }
            arr.push(data)
        }
        const catname=await Category.findOne({name:req.body.category});
        const newProduct = new Product({
            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            category:catname._id,
            addedDate:Date.now(),
            stock:req.body.stock,
            photos: arr
        });
        await Category.findByIdAndUpdate(catname._id,{$inc: {"products": 1}})
        const savedProduct = await newProduct.save();
        // res.status(200).json(savedProduct);
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const viewCategories=async(req,res)=>{
    try {
        const categories=await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}


const viewProducts=async(req,res)=>{
    try {
        const products=await getProducts();
        res.render('admin/products',{products})
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}
//move to helper
const getCategoryNames=async()=>{
    try {
        const data = await Category.distinct('name');
        return data;
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const editProduct=async(req,res)=>{
    try {
        const result = await editProd(req.query.id);
        const categories = await Category.distinct('name');
        res.render('admin/editproduct',{product:result[0],category:result[1],categories})
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const productUpdation=async(req,res)=>{
    try {
        await updateProduct(req.query.id,req.body,req.files);
        res.status(200).json('updated')
    } catch (error) {
        console.log(error.message);
        res.status(500).json('error');
    }
}

const editCategory=async(req,res)=>{
    try {
        const category = await editCat(req.query.id)
        res.render('admin/editcategory',{category})
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const categoryUpdation = async(req,res)=>{
    try {
        await updateCategory(req.query.id,req.body,req.file)
        res.status(200).json('updated')
    } catch (error) {
        console.log(error.message);
        res.status(500).json('error');
    }
}

const removeCategory=async(req,res)=>{
    try {
        await deleteCategory(req.query.id);
        res.status(200).json('deleted')
    } catch (error) {
        console.log(error.message);
        res.status(500).json('error');
    }
}

const removeProduct=async(req,res)=>{
    try {
        await deleteProduct(req.query.id);
        res.status(200).json('deleted')
    } catch (error) {
        console.log(error.message);
        res.status(500).json('error');
    }
}

const getOffers=async(req,res)=>{
    try {
        // const categories = await getCategoryNames();
        //code duplication move to helper
        const categories= await Category.find();
        const catOffered = await getCategoriesWithOffer();
        res.render('admin/offers',{categories,catOffered})
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const newOffer=async(req,res)=>{
    try {
        await addOffer(req.body.category,req.body.discount,req.body.expiry);
        res.redirect('/admin/offers')
    } catch (error) {
        console.log(error.message);
        res.status(500).json('error');
    }
}

const deleteOffer=async(req,res)=>{
    try {
        await removeOffer(req.query.id,req.query.catId)
        res.redirect('/admin/offers')
    } catch (error) {
        console.log(error.message);
        res.status(500).json('error');
    }
}


module.exports={
    addCategory,
    addProduct,
    viewCategories,
    viewProducts,
    getCategoryNames,
    editProduct,
    productUpdation,
    editCategory,
    categoryUpdation,
    removeCategory,
    removeProduct,
    getOffers,
    newOffer,
    deleteOffer
}