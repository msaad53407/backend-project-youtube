import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { MulterFiles } from "../middlewares/multer.middleware";
import { uploadFile } from "../lib/cloudinary";
import ApiResponse from "../utils/ApiResponse";
import jwt from "jsonwebtoken";
import { UserDocument } from "../interfaces/mongoose.gen";
import { ExtendedRequest } from "../middlewares/auth.middleware";

const options = {
  httpOnly: true,
  secure: true,
  maxAge: 86400 * 1000 * 1,
};

const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  // Step 1: Get details from the body of the request.
  // Step 2: Validate the details coming from client.
  // Step 3: Checking if the user already exists (by username or email). If yes then returning and informing the user that account already exists and they should proceed to Login.
  // Step 4: Validate if required images and avatar is sent from client.
  // Step 5: If provided, then uploading the images and avatar to cloudinary.
  // Step 6: Checking if the avatar (specifically) is successfully uploaded or not.
  // Step 7: If user does not exist then create a new user according to the schema.
  // Step 8a : Returning the newly created user if user is created and sending success message to client. Beware to remove password and refresh token fields from the response object.
  // Step 8b : Sending confirmation email to the user provided email So that the user's account can be activated.

  //Step1
  const { fullName, username, email, password } = req.body;
  //Step2
  if (
    [fullName, username, email, password].every(
      (field) => field === undefined || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "Please provide all required fields");
  }

  //Step3
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (user) {
    throw new ApiError(
      409,
      "Account already exists with provided email or username."
    );
  }

  //Step4
  const avatarLocalPath = (req.files as MulterFiles)?.avatar[0]?.path;
  let coverImageLocalPath: string | null = null;

  if (req.files && "coverImage" in req.files) {
    coverImageLocalPath =
      (req.files as MulterFiles).coverImage[0]?.path || null;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required.");
  }

  //Step5
  const avatarUrl = await uploadFile(avatarLocalPath);
  const coverImageUrl = coverImageLocalPath
    ? await uploadFile(coverImageLocalPath)
    : null;

  //Step6
  if (!avatarUrl) {
    throw new ApiError(500, "Error uploading avatar.");
  }

  //Step7

  const registeredUser = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatarUrl,
    coverImage: coverImageUrl || null,
  });

  // We are querying the newly created user from the db to ensure that User is created. Futhermore, we are removing password and refreshToken fields from the response object by specifying which fields to remove in the select option.
  const responseUser = await User.findById(registeredUser._id).select(
    "-password -refreshToken"
  );

  if (!responseUser) {
    throw new ApiError(500, "Error registering user.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, responseUser, "User created successfully."));
});

const generateAccessAndRefreshToken = async (user: UserDocument) => {
  try {
    const accessToken: string = user.generateAccessToken();
    const refreshToken: string = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false, // So that fields are not validated when saved and all changes are directly saved to the db.
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Some Error Occurred while generating Access and Refresh Tokens."
    );
  }
};

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  //Step1 -> Get credentials from user to login.
  //Step2 -> Validate if the given credentials are in correct format.
  //Step3 -> Check if user exists in db according to provided credentials.
  //Step4 -> If user exists, then continue to validate if provided credentials match with the ones in db.
  //Step5 -> If credentials match, then generate 2 tokens, one is Access token and other is Refresh Token.
  //Step6 -> refresh token is stored in db while access token is sent through cookies to the client
  //Step7 -> Return response object with user details.

  const { username, email, password } = req.body;

  if ((!username || username === "") && (!email || email === "")) {
    throw new ApiError(400, "Username or Email is required.");
  }

  if (!password || password === "") {
    throw new ApiError(400, "Password is required.");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isPasswordValid = await user.isPasswordValid(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password.");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 86400 * 1000 * 10, // Setting maxAge to 10 days.
    })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken, // We are sending these again despite of already setting hem in cookies, bcz maybe if a mobile app user is trying to login, in that case we cannot set cookies. So we send tokens to client so that they can securely store them
        },
        "Logged in Successfully."
      )
    );
});

const logoutUser = asyncHandler(async (req: ExtendedRequest, res: Response) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "User Id is required.");
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      { new: true }
    ); // Setting new to true will return user doc with updated fields.

    if (!user) {
      throw new ApiError(404, "User not found.");
    }
  } catch (error) {
    throw new ApiError(500, "Failed to fetch User");
  }

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, null, "User Logged out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenFromUser =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshTokenFromUser) {
    throw new ApiError(400, "Unauthorized Request.");
  }

  try {
    const decodedRefreshToken: any = jwt.verify(
      refreshTokenFromUser,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    const user = await User.findById(decodedRefreshToken?._id);

    if (!user || user?.refreshToken !== refreshTokenFromUser) {
      throw new ApiError(401, "Invalid Refresh Token.");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: 86400 * 1000 * 10, //Set max age to 10 days
      })
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Invalid RefreshToken";
    throw new ApiError(500, errorMessage);
  }
});

export { registerHandler, loginUser, logoutUser, refreshAccessToken };