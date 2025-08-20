import mongoose from "mongoose"

export const connectDB = async() =>
{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB CONNECTED")
    } catch (error) {   
    console.error("error connecting to MONGODB,error");
    process.exit(1);
    }
};






// mongodb+srv://ismailumutluoglu10:4fLGIEwybkA1IwJ3@cluster0.l4py1tg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0