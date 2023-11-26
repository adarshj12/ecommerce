const mongoose = require('mongoose');

const conn = async()=>{
    try {
        // await  mongoose.connect('mongodb://127.0.0.1:27017/ecommerce_application',{useUnifiedTopology:true});
        await  mongoose.connect('mongodb+srv://techspire:techspire@cluster0.mhuu2yr.mongodb.net/techspire?retryWrites=true&w=majority',{useUnifiedTopology:true});
        console.log(`database connected`);
      } catch (error) {
          console.log(`error in connection - ${error.message}`);
      }
}

module.exports=conn;