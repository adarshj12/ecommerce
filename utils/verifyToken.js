const jwt = require('jsonwebtoken');
require('dotenv').config()

const verifyAdmin =async(req,res,next)=>{
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const decoded=jwt.verify(token, process.env.SECRET);
        if(decoded.admin){
            next();
        }    
        else {
            return res.status(401).json({ message: `Unauthorized` });
        } 
    } catch (error) {
        console.log(`error=> ${error.message}`);
        return res.status(403).json({ message: `Authorization failed due to  ${error.message}` })
    }
}


module.exports={
    verifyAdmin
}