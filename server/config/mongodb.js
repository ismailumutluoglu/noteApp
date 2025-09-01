import mongoose from "mongoose";

const connectDB = async() => {

    mongoose.connection.on('connected', ()=> console.log('DATABASE CONNECTED SUCCESSFULLY'));
    await mongoose.connect(`${process.env.MONGODB_URI}/auth`);
};

export default connectDB ; 


