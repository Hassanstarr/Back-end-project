import asyncHandler from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'


const registerUser = asyncHandler( async (req, res) => {

    // Get User detail from frontend
    // Validation - not empty
    // Check if User alread exist - username, email
    // Check for images, check for avatar
    // upload them on cloudinary - avatar
    // Create user object - create entry in db
    // Remove password and refresh token field from response
    // Check for user creation
    // Ruturn response

    const { fullName, email, username, password } = req.body;

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with username or eamil already exists")
    }

    
        // Handle avatar
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            throw new ApiError(400, "Avatar file upload failed");
        }
    
        // Handle coverImage 
        // const coverImageLocalPath = req.files?.coverImage[0]?.path; // Can't deal when user doesn't upload cover Image
        let coverImageUrl = "";
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            const coverImageLocalPath = req.files.coverImage[0].path;
            const coverImage = await uploadOnCloudinary(coverImageLocalPath);
            coverImageUrl = coverImage?.url || "";  // Assign the cover image URL only if it exists
        }
    
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImageUrl,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something wnet wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


} )

export {registerUser}