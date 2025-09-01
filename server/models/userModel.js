import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type : String , required : true , unique : true},
    email : {type : String , required : true},
    password : {type : String , default : ''},
    verifyOtp : {type  : Number , default : 0},
    verifyOtpExpireAt : {type : Date , default : null},
    isAccountVerified : {type : Boolean , default : false},
    resetOtp : {type : String , default : ''} , 
    resetOtpExpireAt : {type : Date , default : null},
});

const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel;   