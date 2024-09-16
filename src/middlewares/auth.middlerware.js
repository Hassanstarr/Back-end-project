import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken"; 


// Using '_' to indicate that 'res' is unused, a common convention for unused parameters.
export const verifyJWT = asyncHandler(async (req, _, next) => {
   
    try {
        // Try to access the token either from cookies (if cookie-parser is used) or from the Authorization header (Bearer <token>).
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        
        // Verify the JWT token using the secret key from environment variables
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);  // Correct the typo
    
        // Fetch the user from the database, excluding password and refresh token fields
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        // Attach the user to the request object for use in subsequent middleware
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
});
