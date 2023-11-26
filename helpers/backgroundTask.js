const Offer = require('../models/offer');
const Category = require('../models/category');
const Product = require('../models/product');
const Coupon = require('../models/coupon')

async function revertProducts(categoryId, discount) {
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new Error(`Category with ID ${categoryId} not found.`);
    }
    await Product.updateMany(
        { category: category._id },
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
}

async function handleExpiredOffers() {
    const expiredOffers = await Offer.find({ expiry: { $lte: new Date() } }).populate('category');

    for (let offer of expiredOffers) {
        // if (!offer.category) {
        //     throw new Error(`Category for offer with ID ${offer._id} not found.`);
        // }
        await Category.updateOne({ _id: offer.category._id }, { offer: false });
        await revertProducts(offer.category._id, offer.discount);
        await Offer.findByIdAndDelete(offer._id);
    }
    const expiredCoupons = await Coupon.find({ expiry: { $lte: new Date() } });
    for(let coupon of expiredCoupons){
        await Coupon.findByIdAndDelete(coupon._id)
    }
}

function startOfferHandling() {
    handleExpiredOffers();
    setInterval(handleExpiredOffers, 24 * 60 * 60 * 1000); 
}

module.exports = startOfferHandling;