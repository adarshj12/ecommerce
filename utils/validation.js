const emailvalidate=(email)=>{
    if(!email.match(/^[a-zA-Z0-9.!#$%&’+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/)) return false;
    return true;
}

const passwordValidate=(password)=>{
    if(!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/)) return false;
    return true;
}

const mobileValidate=(mobile)=>{
    if(!mobile.match(/^\d{10}$/)) return false;
    return true;
}

const sessionOut=(req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/')
    }
}

const adminSession = (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.redirect('/admin');
    }
  };

module.exports={
    emailvalidate,
    passwordValidate,
    mobileValidate,
    sessionOut,
    adminSession
}