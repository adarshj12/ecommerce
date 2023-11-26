const mongoose = require('mongoose');


const ImageSchema = new mongoose.Schema({
    image_url: {
        type: String,
        required: true
    },
    image_id: {
        type: String,
        required: true
    }
});
const bannerSchema = new mongoose.Schema(
    {
      photo: ImageSchema,
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      text: {
        type: String,
        required: true
      }
    },
  );

module.exports = mongoose.model('banner', bannerSchema)