import {v2 as cloudinary} from "cloudinary"
import fs from "fs" //file system (node mai by default milta hai)

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) return null // if path exist he nhi karta

        //uploading file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })

        // file has been uploaded successfully
        console.log("File is Uploaded on Cloudinary : ",response.url);
        return response
    }
    catch(error){
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}