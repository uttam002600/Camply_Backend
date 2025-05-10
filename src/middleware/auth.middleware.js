import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

const authenticate = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (!req.user) {
      throw new ApiError(401, "Invalid access token");
    }

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export default authenticate;
