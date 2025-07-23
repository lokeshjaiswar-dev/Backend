import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // will return a object
        console.log(`\n MongoDB Connected !! DB HOST : ${connectionInstance.connection.host}`); // will give the name ki sahi db connect hua hai na
    } catch(error){
        console.log("MongoDB connection Error : ",error);
        process.exit(1) // immediately iss process ko rokhne ke liye
    }
}

export default connectDB