import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { ApiResponse } from './ApiResponse';
import { ApiError } from './ApiError';


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload function
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // Upload an image
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file have been successfully uploaded
        console.log("File has been successfully uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
            // Remove the local file on failure
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        return null;
    }
}

// // Delete function
// const deleteFromCloudinary = async (publicId) => {
//     try {
//         if (!publicId) return null;

//         // Delete the image from Cloudinary
//         const result = await cloudinary.uploader.destroy(publicId);

//         // Handle the response
//         if (result.result === 'ok') {
//             return result;
//         } else {
//             throw new ApiError(500, "Unable to delete the avatar")
//         }
//     } catch (error) {
//         throw new ApiError(500, "Unable to delete the avatar")
//     }
// };


export {
    uploadOnCloudinary,
    //  deleteFromCloudinary
}
