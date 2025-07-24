import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true    // jisme searching enable karna hai uske liye acha hota hai (thoda costly hai but)
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        fullName : {
            type : String,
            required : true,
            trim : true,
            index : true
        },
        avatar : {
            type : String, // cloudinary url
            required : true,
        },
        coverImage : {
            type : String
        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password : {
            type : String, // iska hume ye sochna hai ki hum passwrod ko encrypt kaise kare, bcoz agar encrypt karenge toh phir login karte check karne ke liye issue ho jayega
            required : [true,"Password is Required"]
        },
        refreshToken : {
            type : String
        }
    },{timestamps : true}
)

// userSchema.pre("save",() => {}) // not recommended to write arrow function in it bcoz it doesn't have access to this keyword

// password encrypt karne ke liye 
userSchema.pre("save", async function(){

    if(!this.isModified("password")) return next() // agar modified nhi hua hai toh return ho jao

    this.password = bcrypt.hash(this.password,10) // kispe lagana hai wo aur kitne hash rounds 
    next()

}) // it will take sometime therefore async function and since it is middle ware we have to give the flag to the next middleware using next()

// password compare karne ke liye(decrypt)
// async isliye cryptography hai computation hoga isliye time lagega
// custom method design karne ke liye methods likha hai
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password); // user ka diya hua password aur encrypted password
    // will return true or false
}

userSchema.methods.genrateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id, // data is stored in the db , so id will be generated automatically
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },;
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);