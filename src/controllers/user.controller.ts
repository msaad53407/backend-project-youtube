import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { MulterFiles } from "../middlewares/multer.middleware";
import { uploadFile } from "../lib/cloudinary";
import ApiResponse from "../utils/ApiResponse";

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
      field => field !== undefined && field?.trim() !== ""
    )
  ) {
    throw new ApiError(400, "Please provide all required fields");
  }

  //Step3
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (user) {
    throw new ApiError(409, "Account already exists with provided email or username.");
  }

  //Step4
  const avatarLocalPath = (req.files as MulterFiles)?.avatar[0]?.path;
  const coverImageLocalPath = (req.files as MulterFiles)?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required.");
  }

  //Step5

  const avatarUrl = await uploadFile(avatarLocalPath);
  const coverImageUrl = await uploadFile(coverImageLocalPath);


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

  return res.status(201).json(new ApiResponse(201, responseUser, "User created successfully."));


});

export { registerHandler };