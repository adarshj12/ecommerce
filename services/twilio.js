require('dotenv').config();
const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSID = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSID, authToken);

const sendOTP=async(phonenumber)=>{
    try {
        await client
            .verify
            .v2.services(serviceSID)
            .verifications
            .create({
                to: `+91${phonenumber}`,
                channel: 'sms'
            })
            .then(data => {
            })
    } catch (err) {
        console.log(err.message)
        return false
    }
}

const verifyOTP=async(phonenumber,code)=>{
    try {
        const data = await client
                            .verify
                            .v2.services(serviceSID)
                            .verificationChecks
                            .create({
                                    to: `+91${phonenumber}`,
                                    code
                            });
        if (data.status === "approved")
        return 'verified'
        else 
        return 'invalid'
    } catch (err) {
        console.log(err.message)
    }
}

module.exports={
    sendOTP,
    verifyOTP
}