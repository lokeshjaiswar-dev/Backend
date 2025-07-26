// require("dotenv").config({path : "./env"}) // this code will work but there is inconsistency in the code bcoz here we have common js and below we are using module js 

// so for this purpose we use this approach
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({
    path:"./env"
})

connectDB() //since it is a async function it will return a promise
.then(() => {
    app.listen(process.env.PORT || 8000, () => { //if db connected then starting the server
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDb Connection Failed !!! ",err);
})


// First Approach

// import express from "express"
// import mongoose from "mongoose"
// import { DB_NAME } from "./constants";
// const app = express() // intialising app to check kya humari express js ki app communicate kar paa rhi hai kya

// ( async() => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//         // to check communication
//         app.on("error",(error) => {
//             console.log("ERROR : ",error);
//             throw error
//         })

//         // if checked 
//         app.listen(process.env.PORT,() => {
//             console.log(`App is listening on post ${process.env.PORT}`);  
//         })

//     }catch(error){
//         console.log("ERROR : ",error);
//         throw error;
//     }
// })()