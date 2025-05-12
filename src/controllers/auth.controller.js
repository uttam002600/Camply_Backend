import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import verifyGoogleToken from "../utils/googleOAuth.js";
import { generateTokens } from "../utils/jwt.js";
import { User } from "../models/user.model.js";

const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Google token is required");
  }

  const googleUser = await verifyGoogleToken(token);
  if (!googleUser) {
    throw new ApiError(401, "Invalid Google token");
  }

  // Check if user exists
  let user = await User.findOne({ email: googleUser.email });

  if (!user) {
    // Create new user
    user = await User.create({
      googleId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.picture,
      isVerified: true,
    });
  } else if (!user.googleId) {
    // Update existing user with Google ID
    user.googleId = googleUser.sub;
    await user.save();
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Set cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken } = generateTokens(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { googleLogin, logout, refreshAccessToken };
