import jwt from "jsonwebtoken"
import { User } from "../models/users.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/ascynHandler.js"

export const verifyJWT = asyncHandler(async(req,_,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") // since humne value store kiya hai cookie mai,kabhi kabar access nhi milta cookies ka isliye header se nikal rhe hai
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const  decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) //humne jo token banate time payload pass kiya tha wo nikal ke dega
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})