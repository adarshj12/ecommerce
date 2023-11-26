const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const connection = require('./config/db');
const cors = require('cors');
const cookieParser=require('cookie-parser')
const logger = require('morgan');
require('dotenv').config();
const PORT = process.env.PORT||4000;
const userRoute= require('./routes/user');
const adminRoute=require('./routes/admin');
const startOfferHandling = require('./helpers/backgroundTask')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cookieParser())


app.use(session({
  secret: 'ecommerce_session',
  resave: false,
  saveUninitialized: true
}));



// app.use(logger('dev'));
app.use(express.json());
app.use(cors())
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));


app.get('/getKey', (req, res) => res.status(200).json({ key: process.env.RAZORPAY_API_KEY }))
app.use('/',userRoute);
app.use('/admin',adminRoute);
app.get('*',(req,res)=>{res.render('404',{user:null,cartCount:0})})

app.listen(PORT,async()=>{
    await connection();
    startOfferHandling();
    console.log(`server connected at ${PORT}`)
})
