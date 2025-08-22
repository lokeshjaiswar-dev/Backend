import {asyncHandler} from "../utils/ascynHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/users.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

// ye ek internal method hai isliye asyncHandler mai wrap karne ki koee jarurat nhi
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId) // id se find kiya user ko
        const accessToken = user.genrateAccessToken() // jo methods humne model mai banaye the wahi use kiya
        const refreshToken = user.genrateRefreshToken()

        // refresh token ko db mai store karenge
        user.refreshToken = refreshToken

        // par ye save karne se pehle error throw karega kyu ki bohot se field humare db mai required the aur yaha hum bas ek field set karrhe hai
        await user.save({validateBeforeSave : false}) //db call hai isliye await

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

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
    // console.log(req.files);   
     
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

const loginUser = asyncHandler(async(req,res) => {
    // req body -> data
    const {email,username,password} = req.body

    // username or email required
    if(!(username || email)){
        throw new ApiError(400,"Username or Email is required")
    }

    //find the user
    const user = await User.findOne({
        $or : [{ email },{ username }]
    })

    // if user nhi mila
    if(!user){
        throw new ApiError(404,"User Does Not Exist")
    }

    // user milne ke baad
    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Password Incorrect")
    }

    //access and referesh token
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id) // iss method mai upar await use kiya tha isliye yaha par bhi

    //send cookie
    // ab data send karna hai par humare pass jo user line no 134 par uske pass refresh token field nhi hoga kyu ki uske liye call humne line 151 pe dala hai , isliye phirse hum ek db call karenge jisme sab values honge jo hume dena hai
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // cookies bhejne se pehle uske options set karne hote hai (jis se bus server se modifiable ho sakenge cookies , frontend se nhi)
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options) // since we have injected cookie parser middleware we can access cookie
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
               user:loggedInUser,accessToken,refreshToken // agar mobile app ke liye bana rhe hai toh waha cookies set nhi hoti isliye aise bhej rhe hai (usecase pe depend karega)
            },
            "User Logged In SuccessFully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    // User.findById() // ye nhi kar sakte bcoz access nhi hai user ka

    // ye method isliye kyu ki agar pehle wle methods se karte toh pehle find karte phir value nikalte phir save karte 
    await User.findByIdAndUpdate(
        req.user._id, // value select karne ke liye
        {
            $set : {
                refreshToken : undefined  // jo value set karna hai
            }
        },
        {
            new : true // ye isliye ki bas new updated value he return ho agar false karenge toh purani value milegi
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
})


export {
    registerUser,
    loginUser,
    logoutUser
}  // when exporting after declaration or for multiple export
// export registerUser  // when declaration and exporting on sametime
