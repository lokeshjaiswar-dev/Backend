import {asyncHandler} from "../utils/ascynHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/users.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async(req,res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar validate
    // create user object - create entry in db
    // remove password and refresh token field from response (user ko return karenge pura user object)
    // check for user creation
    // return res

    // get user details from frontend
    const {fullName,email,username,password} = req.body
    // console.log(req); // bohot kuch ata hai
    // console.log(req.body);    // the data which will be sended in the request
    // console.log("Email : ",email);


    // validation - not empty
    // ye thoda beginner method hogya aise he agar har ek field validate karna hoga toh bohot saare if else likhna padega
    if(fullName === ""){
        throw new ApiError(400,"Full Name is required")
    }

    // expert way
    if(
        [fullName,email,username,password].some((field) => field?.trim() === "") //agae ek bhi field khali rahega toh true return ho jayega
    ){
        throw new ApiError(400,"All fields are required")
    }


    // check if user already exists: username, email

    // User.findOne({username}) // aise bhi single value pass kar sakte hai check karne ke liye , ye function first value jo milega wo return karega
    const existedUser = await User.findOne({ // but for mutiple values we can use mongodb operators
        $or:[{username},{email}]
    })
    // console.log(existedUser); //The entire document object (the first match) from the collection.
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    // check for images, check for avatar
    console.log(req.files);    
    const avatarLocalPath = req.files?.avatar[0]?.path // ye basically public\temp aur file ka name dega quki humne wahi configure kiya hai multer mai

    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath 
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){ //avatar file is must thats why
        throw new ApiError(400,"Avatar file is required")
    }

    // upload them to cloudinary, avatar validate
    const avatar = await uploadOnCloudinary(avatarLocalPath) //since it will take time await use kiya hai
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) 

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }


    // create user object - create entry in db
    const user = await User.create({ // db call hai toh time lagega and it will create the entire object created
        fullName,
        avatar : avatar.url, //cloudinary method se pura object return ho rha hai
        coverImage: coverImage?.url || "", //agar coverImage hai toh url nikal lo 
        email,
        password,
        username : username.toLowerCase()
    })

    // remove password and refresh token field from response (user ko return karenge pura user object) (SELECT)

     //db mai value store hogya uske confirmation ke liye aur iske andar bhi sab value aa jayega 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //this will remove the selected fields from the object
    )

    // check for user creation
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }


    // return res
    // we will send in a well structure format therefore using ApiResponse
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )

})



export {registerUser}  // when exporting after declaration or for multiple export
// export registerUser  // when declaration and exporting on sametime
