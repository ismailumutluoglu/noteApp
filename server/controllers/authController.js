import bcrypt from "bcryptjs";
import pkg from "jsonwebtoken";
const { JsonWebTokenError } = pkg;
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

export const register = async(req,res) => {
    const {name,password,email} = req.body;

    if(!name || !password || !email){
        return res.json({success : false,message : 'Missing Details...'});
    }

    try {
        // Hem email hem de name için kontrol
        const existingUser = await userModel.findOne({ $or: [ { email }, { name } ] });
        if(existingUser){
            return res.json({success : false , message : "User already exist"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({name,password:hashedPassword,email});
        await user.save();

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly : true , 
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000
        });

        //Sending welcome email 
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Smile Clup',
            text: `Welcome to Smile's Clup . Your account has ben created with email id:${email}`
        }

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "User registered successfully" });

    } catch (error) {
        return res.json({success : false,message : error});
    }
}
export const login = async(req,res) => {
    const {email,password} = req.body ; 

    if(!email || !password){
        return res.json({success:false,message : "email or password required."});
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"Invalid email adress."});
        }
        
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.json({success: false , message : "Invalid password"});
        }
        
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly : true , 
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({ success: true, message: "User login successfully" });
    } catch (error) {
        return res.json({success:false,message : "ERROR"});
    }
}
export const logout = async(req,res) => {
    try {
        res.clearCookie('token',{
            httpOnly : true , 
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })
        return res.json({success : true , message : "Logout successfully"})
    } catch (error) {
        return res.json({success : false , message : error.message});
    }
}
export const deleteUser = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await userModel.deleteOne({ email });
        if (result.deletedCount === 0) {
            return res.json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
//Send Verification OTP to the User's Email 
export const sendVerifyOtp = async(req,res) => {
    try {
        
        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success:false,message : "Account already verified"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp ;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000 ; 
        await user.save();

        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : user.email,
            subject : "Account verification OTP",
            text : `Your OTP is ${otp}. Verify your account using this OTP.`
        }

        await transporter.sendMail(mailOptions);
        res.json({success:true , message : "Verification OTP sent on Email"});
    } catch (error) {
        res.json({success:false, message : error.message});
    }
}
export const verifyEmail = async(req,res) => {
    const { userId , otp } = req.body;

    if(!userId || !otp){
        return res.json({success : false , message : "Missing Details"});
    }

    try {
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success : false , message : "User not found"});
        }

        if(user.verifyOtp === '' || String(user.verifyOtp) !== String(otp)){
            return res.json({success : false , message : "Invalid OTP"});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success : false , message : "OTP Expired"});
        }

        user.isAccountVerified = true ; 
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0 ; 

        await user.save();

        return res.json({success : true , message : "email verified successfully"});

    } catch (error) {
        return res.json({success : false , message : error.message});
    }
}
// Check if user is  authenticated
export const isAuthenticated = async(req,res) => {
    try {
        return res.json({success : true});
    } catch (error) {
         return res.json({success : false , message : error.message});
    }
}
// send password reset otp  
export const sendResetOtp = async(req,res) => {
    const { email } = req.body ; 

    if(!email){
        return res.json({success : false , message : "Email is required"});
    }

    try {
        
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success : false , message : "User not found"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp ;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000 ; 

        await user.save();

        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : user.email,
            subject : "Password Rest OTP",
            text : `Your OTP for resetting your password is ${otp}.Use this OTP to proceed with resetting your password.`
        };

        await transporter.sendMail(mailOptions);

        return res.json({success : true , message : "OTP sent your email "});

    } catch (error) {
        return res.json({success : false , message : error.message});
    }
}
//     RESET USER PASSWORD 
export const resetPassword = async(req,res) =>{
    const {email , otp , newPassword} = req.body ; 

    if(!email || !otp || !newPassword){
        return req.json({success : false , message : 'Email , OTP or newpassword required'}); 
    }

    try {
        
    const user = await userModel.findOne({email});   

    if(!user){
        return res.json({success : false , message : "User not found"});
    }

    if(user.resetOtp === "" || user.resetOtp !== otp){
        return res.json({success : false , message : "Invalid OTP"});
    }

    if(user.resetOtpExpireAt < Date.now()){
        return res.json({success : false , message : "OTP expired"});
    }

    const hashedPassword = await bcrypt.hash(newPassword,10);

    user.password = hashedPassword
    user.resetOtp = '' ; 
    user.resetOtpExpireAt = 0 ;
    await user.save();

    return res.json({success : true , message : "Password has been reset"});

    } catch (error) {
        return req.json({success : false , message : error.message});
    }
}