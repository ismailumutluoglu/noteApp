import mongoose from "mongoose"
// first schema
const noteSchema = new mongoose.Schema(
    {
        title : 
        {
            type : String,
            required : true,
        },
        content : 
        {
            type : String,
            required : true ,
        },   
    },
    {
        timestamps : true
    }
);

//second mode

const Note = mongoose.model("Note",noteSchema);

export default Note 