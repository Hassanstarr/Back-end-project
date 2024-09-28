import asyncHandler from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js'
// import { deleteFromCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

        
    } catch (error) {
        throw new ApiError(500, "Something went worng while genreate access and refresh token")
    }
}


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

    // $or is mongoosedb operator
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


const loginUser = asyncHandler( async (req, res) => {
    // get data from req boby
    // get from user username or email
    // find user from database - if not exist than send response username doesn't esist
    // password check
    // access and refresh token generate
    // send data in cookie

    const {email, username, password} = req.body

    if( !(username || email) ){
        throw new ApiError(400, "username or email is required")
    }

    // $or is mongoosedb operator
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    // isPasswordCorrect is self made method thats why used user and not User
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )
    
    
} )


const logoutUser = asyncHandler( async(req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {           // Use $unset to completely remove the refreshToken field from the document
                refreshToken: 1 // This removes the refreshToken field from the document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
    
    
} )


const refreshAccessToken = asyncHandler( async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
    throw new ApiError(401, "Unauthhorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )    
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "invalid refresh token")
        }
        
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookies("accessToken", accessToken, options)
        .cookies("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, newRefreshToken},
                "Access Token refreshed"
            )
        )
        
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

} )


const changeCurrentPassword = asyncHandler( async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = new user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully"))
    
} )


const getCurrentUser = asyncHandler( async(req, res) => {
    return res
    .status(200
    .json(new ApiResponse(200, req.user, "current user fethced successfully"))
    )
} )


const updateAccountDetails = asyncHandler( async(req, res) => {
    const {fullName, email} = req.body
    
    if(!fullName || !email) {
        throw new ApiError(400, "All field required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email    // both typing method is correct
            }
        },
        { new: true  } // if new is true than the data save in varaible will be after the $set update the database
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account detail update successfully"))
    
} )


const updateUserAvatar = asyncHandler( async(req, res) => {
    const avatarLocalPath = res.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar")
    }

        // ** From deteling old avatar **
    // // Retrieve the user to get the old avatar
    // const user = await User.findById(req.user._id);

    // if (!user) {
    //     throw new ApiError(404, "User not found");
    // }

    // // Check if there is an old avatar and delete it from Cloudinary
    // if (user.avatar) {
    //     // Extract public ID from the old avatar URL (Cloudinary stores this before file extension)
    //     const publicId = user.avatar.split('/').pop().split('.')[0]; // Extract the public ID from the URL

    //     try {
    //         const deletingOldAvatar = await deleteFromCloudinary(publicId);

    //         if (deletingOldAvatar.result !== 'ok') {
    //             throw new ApiError(400, "Old avatar deletion failed");
    //         }
    //     } catch (error) {
    //         console.error("Error deleting old avatar:", error.message);
    //         throw new ApiError(500, "Error while deleting the old avatar");
    //     }
    // }

    const updateUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url, // Set the new avatar URL
            }
        },
        {new: true}
    ).select("-password"); // Exclude password field from response

    return res
    .status(200)
    .json(new ApiResponse(200, updateUser, "Avatar update successfully"))
    
    
} )


const updateUserCoverImage = asyncHandler( async(req, res) => {
    const coverImageLocalPath = res.file?.path

    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading cover image")
    }

        // ** From deteling old cover Image **
    // // Retrieve the user to get the old cover image
    // const user = await User.findById(req.user._id);

    // if (!user) {
    //     throw new ApiError(404, "User not found");
    // }

    // // Check if there is an old cover image and delete it from Cloudinary
    // if (user.coverImage) {
    //     // Extract public ID from the old cover image URL (Cloudinary stores this before the file extension)
    //     const publicId = user.coverImage.split('/').pop().split('.')[0]; // Extract the public ID from the URL

    //     try {
    //         const deletingOldCoverImage = await deleteFromCloudinary(publicId);

    //         if (deletingOldCoverImage.result !== 'ok') {
    //             throw new ApiError(400, "Old cover image deletion failed");
    //         }
    //     } catch (error) {
    //         console.error("Error deleting old cover image:", error.message);
    //         throw new ApiError(500, "Error while deleting the old cover image");
    //     }
    // }
    
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url, // Set the new cover image URL
            }
        },
        {new: true}
    ).select("-password"); // Exclude password field from the response

    return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Cover Image update successfully"))
    
    
} )


const getUserChannelProfile = asyncHandler( async(req, res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                ChannelSubscribedToCount: {
                    $size: "subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    } 
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                ChannelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfuly")
    )
    
    
} )


const getWatchHistory = asyncHandler( async(req,res) => {
    // In aggregation pipelines, we must use "new mongoose.Types.ObjectId(req.user._id)" 
    // to convert the user ID to a proper ObjectId type for matching, since MongoDB stores _id as ObjectId. 
    // However, in simpler Mongoose queries, "req.user._id" can be used directly, as Mongoose will handle the conversion internally.
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)  // Step 1: Match the current user by their ObjectId
            }
        },
        {
            $lookup: {                                          // Step 2: Lookup related documents from the "videos" collection
                from: "videos",                                 // Collection to join with
                localField: "watchHistory",                     // Local field containing the user's watched video IDs
                foreignField: "_id",                            // Foreign field in the "videos" collection (i.e., the video IDs)
                as: "watchHistory",                             // The result will be stored in "watchHistory" field
                pipeline:  [                                    // Nested pipeline for further transformations on "videos"
                    {
                        $lookup: {                              // Step 3: Lookup video owners from the "users" collection
                            from: "users",
                            localField: "owner",                // Video's owner field
                            foreignField: "_id",                // Owner's ID in the "users" collection
                            as: "owner",                        // Result stored in the "owner" field
                            pipeline: [                         // Nested pipeline to project only specific fields
                                {
                                    $project: {                 // Step 4: Select only relevant fields for the video owner
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {                           // Step 5: Convert the "owner" array into a single object
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch History fetched successfully"
        )
    )
    
} )



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}