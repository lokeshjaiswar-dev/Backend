import {asyncHandler} from "../utils/ascynHandler.js"

const registerUser = asyncHandler( async(req,res) => {
    res.status(200).json({
        message : "Lokesh Bhai ka server chal pada"
    })
} )

export {registerUser}  // when exporting after declaration or for multiple export
// export registerUser  // when declaration and exporting on sametime
